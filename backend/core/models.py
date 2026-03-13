import uuid
from django.db import models
from django.contrib.auth.models import User

class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Student(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile', null=True, blank=True)
    roll_number = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    year = models.IntegerField()
    # Basic demographic info
    contact_number = models.CharField(max_length=20, null=True, blank=True)
    parent_contact = models.CharField(max_length=20, null=True, blank=True)
    
    current_risk_score = models.FloatField(null=True, blank=True)
    risk_band = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.roll_number})"

class Profile(BaseModel):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('counsellor', 'Counsellor'),
        ('warden', 'Warden'),
        ('admin', 'Admin'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    linked_student = models.OneToOneField(Student, on_delete=models.SET_NULL, null=True, blank=True, related_name="linked_profile")

    def __str__(self):
        return f"{self.user.username} - {self.role}"


class AcademicRecord(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='academic_records')
    semester = models.IntegerField()
    gpa = models.FloatField()
    attendance_percentage = models.FloatField()
    active_backlogs = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.student.roll_number} - Sem {self.semester}"


class BehavioralLog(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='behavioral_logs')
    date = models.DateField()
    activity_type = models.CharField(max_length=100) # e.g., 'Library Late', 'Mess Skipped', 'Curfew Violation'
    severity = models.CharField(max_length=50, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')])
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.roll_number} - {self.activity_type} ({self.severity})"


class MoodCheckin(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='mood_checkins')
    date = models.DateField()
    mood_score = models.IntegerField() # e.g., 1-10
    sleep_hours = models.FloatField(default=7.0)
    stress_level = models.IntegerField(default=5) # e.g., 1-10
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.roll_number} - Mood: {self.mood_score}"


class RiskAssessment(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='risk_assessments')
    total_risk_score = models.FloatField() # e.g., 0-100
    risk_level = models.CharField(max_length=50, choices=[('low', 'Low'), ('moderate', 'Moderate'), ('high', 'High'), ('critical', 'Critical')])
    contributing_factors = models.JSONField(default=dict) # e.g., {"attendance": 0.4, "behavior": 0.6}
    explanation = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.roll_number} - {self.risk_level} ({self.total_risk_score})"


class Alert(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='alerts')
    message = models.TextField()
    alert_type = models.CharField(max_length=50) # e.g., 'academic_drop', 'behavior_spike', 'mood_low'
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student.roll_number} - {self.alert_type} ({'Resolved' if self.is_resolved else 'Active'})"


class Intervention(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='interventions')
    counsellor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={'profile__role': 'counsellor'}, related_name='assigned_interventions')
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('in_progress', 'In Progress'), ('completed', 'Completed')])
    notes = models.TextField(null=True, blank=True)
    scheduled_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Intervention: {self.student.roll_number} by {self.counsellor.username if self.counsellor else 'Unassigned'}"


class HostelBlock(BaseModel):
    name = models.CharField(max_length=50, unique=True)
    capacity = models.IntegerField()
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name


class Room(BaseModel):
    block = models.ForeignKey(HostelBlock, on_delete=models.CASCADE, related_name='rooms')
    room_number = models.CharField(max_length=20)
    capacity = models.IntegerField()

    class Meta:
        unique_together = ('block', 'room_number')

    def __str__(self):
        return f"{self.block.name} - {self.room_number}"


class RoomAllocation(BaseModel):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='allocations')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='room_allocations')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.student.roll_number} -> {self.room}"


class ResourceUsage(BaseModel):
    location = models.CharField(max_length=100) # e.g., 'Lab-3', 'Block-A Mess'
    resource_type = models.CharField(max_length=50, choices=[('energy', 'Energy (kWh)'), ('water', 'Water (L)'), ('mess', 'Mess (Meals)')])
    timestamp = models.DateTimeField()
    quantity = models.FloatField()

    def __str__(self):
        return f"{self.location} - {self.resource_type}: {self.quantity}"
