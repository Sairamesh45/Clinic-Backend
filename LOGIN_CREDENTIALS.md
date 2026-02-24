# 🏥 Clinic Management System - Login Credentials

## Test Accounts

All accounts use the password: **`password123`**

---

### 👨‍⚕️ DOCTORS

| Email | Name | Clinic | Specialty |
|-------|------|--------|-----------|
| `john.doe@clinic.com` | Dr. John Doe | City Care Medical Center | General Practitioner |
| `emily.johnson@clinic.com` | Dr. Emily Johnson | City Care Medical Center | Cardiologist |
| `sarah.smith@clinic.com` | Dr. Sarah Smith | Sunrise Family Clinic | Pediatrician |
| `christopher.lee@clinic.com` | Dr. Christopher Lee | Quick Care Walk-In Clinic | General Practitioner |

---

### 🏥 RECEPTIONISTS

| Email | Clinic |
|-------|--------|
| `reception@citycare.com` | City Care Medical Center |
| `reception@sunrise.com` | Sunrise Family Clinic |
| `reception@healthplus.com` | HealthPlus Multispecialty Hospital |
| `reception@greenvalley.com` | Green Valley Wellness Center |
| `reception@quickcare.com` | Quick Care Walk-In Clinic |

---

### 🧑 PATIENT

| Email | Name |
|-------|------|
| `alice.patient@example.com` | Alice Patient |

---

## What's Fixed

✅ **User-Patient Link**: When patients register, a Patient record is automatically created and linked to their User account

✅ **Appointment Booking**: Patients can now book appointments successfully - their User ID is properly mapped to their Patient ID

✅ **Doctor Dashboard**: Removed the confusing "choose doctor" dropdown - doctors only see their own appointments

✅ **Clinic Selection**: Patients see clinics with:
- Distance from their location
- Estimated wait time
- Number of people in queue
- Available doctors (2-3 per clinic)
- Next token number they'll receive

---

## Database Structure

```
User (authentication)
 └─> Patient (medical records) ← Appointment → Doctor
                                                  └─> Clinic
```

- Doctors and Receptionists can view patient details when they have appointments
- Patient data is visible to the clinic staff for the appointments booked at their clinic
