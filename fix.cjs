const fs = require('fs');
const path = 'prisma/schema.prisma';
let schema = fs.readFileSync(path, 'utf8');
schema = schema.replace(
  /model Doctor \{([\s\S]*?)\}/,
  (match, p1) => \model Doctor {\  revenueData Json?\n  patientVisitsData Json?\n  totalAppointmentsCount Int? @default(24)\n  completedAppointments Int? @default(16)\n  remainingAppointments Int? @default(8)\n  appointmentGrowth String? @default(\"+12%\")\n}\
);
fs.writeFileSync(path, schema);
