import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/prisma/client.js";
import { describe, it, before, after, beforeEach } from "node:test";
import assert from "assert";

const api = request(app);

const isoToday = (hours = 9) => {
  const d = new Date();
  d.setUTCHours(hours, 0, 0, 0);
  return d.toISOString();
};

const startOfDayValue = (value = new Date()) => {
  const d = new Date(value);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

describe("Appointments integration tests", () => {
  let doctor;
  let patientA;
  let patientB;

  before(async () => {
    await prisma.appointment.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.doctor.deleteMany();

    doctor = await prisma.doctor.create({ data: { name: "Dr Test", specialty: "GP", clinicId: 1 } }).catch(async () => {
      await prisma.clinic.upsert({ where: { id: 1 }, update: {}, create: { id: 1, name: "Default Clinic" } });
      return prisma.doctor.create({ data: { name: "Dr Test", specialty: "GP", clinicId: 1 } });
    });

    patientA = await prisma.patient.create({ data: { name: "Alice", email: "alice@example.test" } });
    patientB = await prisma.patient.create({ data: { name: "Bob", email: "bob@example.test" } });
  });

  after(async () => {
    await prisma.appointment.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.appointment.deleteMany();
  });

  it("Duplicate booking attempt is rejected", async () => {
    const payload = { doctorId: doctor.id, patientId: patientA.id, date: isoToday(9), status: "BOOKED" };

    const res1 = await api.post("/appointments").send(payload);
    assert.ok([201, 200].includes(res1.status));

    const res2 = await api.post("/appointments").send(payload);
    assert.ok([409, 500].includes(res2.status));

    const dbCount = await prisma.appointment.count({ where: { doctorId: doctor.id, patientId: patientA.id } });
    assert.strictEqual(dbCount, 1);
  });

  it("Concurrent booking - only one appointment created", async () => {
    const payload = { doctorId: doctor.id, patientId: patientB.id, date: isoToday(10), status: "BOOKED" };

    const p1 = api.post("/appointments").send(payload);
    const p2 = api.post("/appointments").send(payload);

    const results = await Promise.all([p1, p2]);
    const statuses = results.map((r) => r.status);
    assert.ok(statuses.includes(201));
    assert.ok(statuses.includes(409) || statuses.includes(500));

    const dbCount = await prisma.appointment.count({ where: { doctorId: doctor.id, patientId: patientB.id } });
    assert.strictEqual(dbCount, 1);
  });

  it("Same patient cannot double book same day with same doctor", async () => {
    const payload1 = { doctorId: doctor.id, patientId: patientA.id, date: isoToday(11), status: "BOOKED" };
    const payload2 = { doctorId: doctor.id, patientId: patientA.id, date: isoToday(15), status: "BOOKED" };

    const r1 = await api.post("/appointments").send(payload1);
    assert.ok([201, 200].includes(r1.status));

    const r2 = await api.post("/appointments").send(payload2);
    assert.ok([409, 500].includes(r2.status));

    const dbCount = await prisma.appointment.count({ where: { doctorId: doctor.id, patientId: patientA.id } });
    assert.strictEqual(dbCount, 1);
  });

  it("Patient not arriving: calling next without ARRIVED returns 404 and does not move appointments", async () => {
    const dayStart = startOfDayValue();
    const a1 = await prisma.appointment.create({ data: { doctorId: doctor.id, patientId: patientA.id, date: new Date(), tokenNumber: 1, status: "BOOKED", dateOnly: dayStart } });
    const a2 = await prisma.appointment.create({ data: { doctorId: doctor.id, patientId: patientB.id, date: new Date(), tokenNumber: 2, status: "BOOKED", dateOnly: dayStart } });

    const res = await api.post(`/appointments/${doctor.id}/next`).send();
    assert.strictEqual(res.status, 404);

    const inConsult = await prisma.appointment.count({ where: { doctorId: doctor.id, status: "IN_CONSULTATION" } });
    assert.strictEqual(inConsult, 0);

    const arriveRes = await api.put(`/appointments/${a1.id}/arrive`).send();
    assert.strictEqual(arriveRes.status, 200);

    const nextRes = await api.post(`/appointments/${doctor.id}/next`).send();
    assert.strictEqual(nextRes.status, 200);

    const inConsultAfter = await prisma.appointment.findUnique({ where: { id: a1.id } });
    assert.strictEqual(inConsultAfter.status, "IN_CONSULTATION");
  });

  it("Doctor calling next rapidly moves distinct patients to IN_CONSULTATION", async () => {
    const created = [];
    for (let i = 1; i <= 3; i++) {
      const p = await prisma.patient.create({ data: { name: `Rapid${i}`, email: `rapid${i}@example.test` } });
      const appointmentDate = new Date();
      const ap = await prisma.appointment.create({ data: { doctorId: doctor.id, patientId: p.id, date: appointmentDate, tokenNumber: i, status: "BOOKED", dateOnly: startOfDayValue(appointmentDate) } });
      await prisma.appointment.update({ where: { id: ap.id }, data: { status: "ARRIVED", arrivalTime: new Date() } });
      created.push(ap);
    }

    const calls = [];
    for (let i = 0; i < 3; i++) {
      calls.push(api.post(`/appointments/${doctor.id}/next`).send());
    }

    const results = await Promise.all(calls);
    results.forEach((r) => assert.strictEqual(r.status, 200));

    const inConsultCount = await prisma.appointment.count({ where: { doctorId: doctor.id, status: "IN_CONSULTATION" } });
    assert.strictEqual(inConsultCount, 3);
  });
});
