import json
from datetime import datetime, timedelta
from django.db.models import Avg, Sum
from core.models import Student, AcademicRecord, BehavioralLog, MoodCheckin, RiskAssessment, Alert, Intervention

def calculate_student_risk(student):
    """
    Computes a weighted risk score mathematically.
    Returns:
       score (float): 0 to 100
       band (str): low | moderate | high | critical
       factors (dict): JSON dict breaking down points per factor
       explanation (str): Human-readable textual summary
    """
    factors = {}
    total_score = 0.0
    explanation_lines = []

    today = datetime.now().date()
    thirty_days_ago = today - timedelta(days=30)
    seven_days_ago = today - timedelta(days=7)

    # === ACADEMIC (Max 40 points) ===
    academic_score = 0.0
    academic_records = student.academic_records.order_by('-semester')
    
    if academic_records.exists():
        current_record = academic_records.first()
        
        # 1. Attendance points (Max 20)
        # Assuming below 75% is risky. 1 point for every % below 75%.
        attendance_penalty = 0.0
        if current_record.attendance_percentage < 75.0:
            attendance_penalty = min(20.0, (75.0 - current_record.attendance_percentage) * 1.0)
            factors['attendance_drop'] = {
                'points': round(attendance_penalty, 2),
                'detail': f"Attendance is critically low at {current_record.attendance_percentage}%"
            }
            if attendance_penalty > 0:
                explanation_lines.append(factors['attendance_drop']['detail'])
            academic_score += attendance_penalty
            
        # 2. Backlogs points (Max 10)
        # 5 points per active backlog
        backlog_penalty = min(10.0, current_record.active_backlogs * 5.0)
        factors['backlogs'] = {
            'points': round(backlog_penalty, 2),
            'detail': f"Student has {current_record.active_backlogs} active backlogs."
        }
        if backlog_penalty > 0:
            explanation_lines.append(factors['backlogs']['detail'])
        academic_score += backlog_penalty

        # 3. GPA trend/drop (Max 10)
        gpa_penalty = 0.0
        if academic_records.count() > 1:
            prev_record = academic_records[1]
            if current_record.gpa < prev_record.gpa:
                drop = prev_record.gpa - current_record.gpa
                gpa_penalty = min(10.0, drop * 10.0) # 0.5 drop = 5 pts, 1.0 drop = 10 pts
                factors['gpa_drop'] = {
                    'points': round(gpa_penalty, 2),
                    'detail': f"GPA dropped from {prev_record.gpa} to {current_record.gpa}."
                }
                explanation_lines.append(factors['gpa_drop']['detail'])
        academic_score += gpa_penalty

    # === BEHAVIORAL (Max 30 points) ===
    behavioral_score = 0.0
    logs = student.behavioral_logs.filter(date__gte=thirty_days_ago)

    # Late entries (Max 15 points) - 5 points per incident
    late_entries = logs.filter(activity_type__icontains='Late').count()
    curfew_violations = logs.filter(activity_type__icontains='Curfew').count()
    total_lates = late_entries + curfew_violations
    lates_penalty = min(15.0, total_lates * 5.0)
    
    if lates_penalty > 0:
        factors['late_entries'] = {
            'points': round(lates_penalty, 2),
            'detail': f"{total_lates} late/curfew incidents in the last 30 days."
        }
        explanation_lines.append(factors['late_entries']['detail'])
    behavioral_score += lates_penalty

    # Meals skipped (Max 5 points) - 1 point per incident
    meals_skipped = logs.filter(activity_type__icontains='Mess Skipped').count()
    meals_penalty = min(5.0, meals_skipped * 1.0)
    if meals_penalty > 0:
        factors['meals_skipped'] = {
            'points': round(meals_penalty, 2),
            'detail': f"Skipped {meals_skipped} meals recently."
        }
        explanation_lines.append(factors['meals_skipped']['detail'])
    behavioral_score += meals_penalty

    # Library / Club Disengagement (Max 10 points)
    # Assume we flag 'Library Absence' or 'Club Absence'
    absences = logs.filter(activity_type__icontains='Absence').count()
    absence_penalty = min(10.0, absences * 5.0)
    if absence_penalty > 0:
        factors['disengagement'] = {
            'points': round(absence_penalty, 2),
            'detail': f"Flagged for {absences} disengagement events (Library/Clubs)."
        }
        explanation_lines.append(factors['disengagement']['detail'])
    behavioral_score += absence_penalty


    # === WELLBEING & MOOD (Max 30 points) ===
    wellbeing_score = 0.0
    recent_moods = student.mood_checkins.filter(date__gte=seven_days_ago)
    
    if recent_moods.exists():
        avg_mood = recent_moods.aggregate(Avg('mood_score'))['mood_score__avg'] or 10.0
        avg_sleep = recent_moods.aggregate(Avg('sleep_hours'))['sleep_hours__avg'] or 7.0
        avg_stress = recent_moods.aggregate(Avg('stress_level'))['stress_level__avg'] or 5.0

        # Mood (Max 10)
        mood_penalty = max(0.0, min(10.0, (6.0 - avg_mood) * 2.5))
        if mood_penalty > 0:
            factors['mood_trend'] = {'points': round(mood_penalty, 2), 'detail': f"Average mood score is critically low ({round(avg_mood, 1)})."}
            explanation_lines.append(factors['mood_trend']['detail'])
        wellbeing_score += mood_penalty
        
        # Sleep (Max 10)
        sleep_penalty = max(0.0, min(10.0, (7.0 - avg_sleep) * 3.33)) # < 4 hours gets 10 points
        if sleep_penalty > 0:
            factors['sleep_deprivation'] = {'points': round(sleep_penalty, 2), 'detail': f"Averaging only {round(avg_sleep, 1)} hours of sleep."}
            explanation_lines.append(factors['sleep_deprivation']['detail'])
        wellbeing_score += sleep_penalty

        # Stress (Max 10)
        stress_penalty = max(0.0, min(10.0, (avg_stress - 5.0) * 2.0)) # > 5 gets penalty
        if stress_penalty > 0:
            factors['high_stress'] = {'points': round(stress_penalty, 2), 'detail': f"High reported daily stress levels ({round(avg_stress, 1)} / 10)."}
            explanation_lines.append(factors['high_stress']['detail'])
        wellbeing_score += stress_penalty


    # Sum everything up and bound 0-100
    total_score = min(100.0, academic_score + behavioral_score + wellbeing_score)
    total_score = round(total_score, 2)
    
    # Risk Bands Definition
    if total_score < 30.0:
        risk_band = 'low'
    elif total_score < 60.0:
        risk_band = 'moderate'
    elif total_score < 75.0:
        risk_band = 'high'
    else:
        risk_band = 'critical'

    # Build Explanation
    if not explanation_lines:
         explanation = f"Student is performing well globally. Score: {total_score}/100."
    else:
         explanation = f"Calculated score of {total_score}/100. Factors contributing towards risk:\n" + "\n- ".join([""] + explanation_lines)

    return total_score, risk_band, factors, explanation

def run_risk_engine_for_all():
    """
    Batch computes risk for all students, saves the latest risk Assessment,
    updates the Student record, and triggers alerts/interventions appropriately.
    """
    students = Student.objects.all()
    count = 0
    for student in students:
        score, band, factors, explanation = calculate_student_risk(student)
        
        # Save Assessment
        RiskAssessment.objects.create(
            student=student,
            total_risk_score=score,
            risk_level=band,
            contributing_factors=factors,
            explanation=explanation
        )

        # Update cache on Student model
        student.current_risk_score = score
        student.risk_band = band
        student.save()
        count += 1

        # Check for alert triggers
        if band in ['high', 'critical']:
            # Create an alert if there isn't one active
            has_active_alert = Alert.objects.filter(student=student, is_resolved=False).exists()
            if not has_active_alert:
                Alert.objects.create(
                    student=student,
                    alert_type=f'risk_level_{band}',
                    message=f"Risk engine flagged {student.name} as {band.upper()} risk ({score}/100).\nDetails: {explanation}"
                )
            
            # If critical, assign an intervention automatically
            if band == 'critical':
                has_active_intervention = Intervention.objects.filter(student=student, status__in=['pending', 'in_progress']).exists()
                if not has_active_intervention:
                    Intervention.objects.create(
                        student=student,
                        status='pending',
                        notes=f"Automated assignment due to CRITICAL risk boundary crossed ({score}/100)."
                    )
    print(f"Risk engine completed scoring for {count} students.")
