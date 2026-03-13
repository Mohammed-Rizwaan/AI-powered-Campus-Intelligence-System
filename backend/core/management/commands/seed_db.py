import random
from datetime import datetime, timedelta, date
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import (
    Student, Profile, AcademicRecord, BehavioralLog, MoodCheckin,
    RiskAssessment, Alert, Intervention, HostelBlock, Room,
    RoomAllocation, ResourceUsage
)


class Command(BaseCommand):
    help = 'Seeds the database with a synthetic dataset for CampusIQ'

    def handle(self, *args, **kwargs):
        self.stdout.write('Clearing existing data...')
        
        # Clearing data (idempotent design)
        User.objects.all().delete()
        HostelBlock.objects.all().delete()
        ResourceUsage.objects.all().delete()
        
        self.stdout.write('Creating Roles and Users...')
        
        # Create core personnel
        admin_user = User.objects.create_superuser('admin_iq', 'admin@campusiq.com', 'admin_123')
        Profile.objects.create(user=admin_user, role='admin')

        counsellor_user = User.objects.create_user('counselor_rita', 'rita@campusiq.com', 'counselor_123')
        Profile.objects.create(user=counsellor_user, role='counsellor')

        warden_user = User.objects.create_user('warden_kumar', 'kumar@campusiq.com', 'warden_123')
        Profile.objects.create(user=warden_user, role='warden')

        self.stdout.write('Setting up Hostel Blocks and Rooms...')
        # We need roughly 50 students total. Let's make capacity 25 per block (13 rooms of 2).
        blocks_data = [
            {'name': 'Block-A', 'target_occupancy': 14}, # ~54%
            {'name': 'Block-B', 'target_occupancy': 10},
            {'name': 'Block-C', 'target_occupancy': 23}, # ~92%
            {'name': 'Block-D', 'target_occupancy': 5},
        ]
        
        blocks = []
        rooms = {}
        for bd in blocks_data:
            block = HostelBlock.objects.create(name=bd['name'], capacity=26)
            blocks.append(block)
            rooms[block.name] = []
            for r in range(1, 14):
                room = Room.objects.create(block=block, room_number=f"{block.name[-1]}-{100+r}", capacity=2)
                rooms[block.name].append((room, 0)) # track occupancy: (room_obj, current_students)

        self.stdout.write('Generating Students & Allocations...')
        
        departments = ['CSE', 'ECE', 'MECH', 'EEE', 'CIVIL']
        names = ['Rahul', 'Anjali', 'Karan', 'Sneha', 'Vikram', 'Pooja', 'Rohan', 'Neha', 'Aditya', 'Shruti',
                 'Ravi', 'Kavya', 'Siddharth', 'Pragya', 'Arjun', 'Ria', 'Manoj', 'Simran', 'Aman', 'Sanya']

        total_created = 0
        students_list = []
        
        # Create our specific target "Priya"
        priya_user = User.objects.create_user('priya_s', 'priya@campusiq.com', 'priya_123')
        priya = Student.objects.create(
            user=priya_user,
            roll_number='CSE-2024-001',
            name='Priya Sharma',
            department='CSE',
            year=2,
            contact_number='9876543210'
        )
        Profile.objects.create(user=priya_user, role='student', linked_student=priya)
        students_list.append(priya)
        total_created += 1

        # Determine Block C assignment for Priya to show overloading context
        # Actually any block is fine, let's put her in Block-C
        
        for bd in blocks_data:
            block_name = bd['name']
            target = bd['target_occupancy']
            
            for i in range(target):
                s = None
                if block_name == 'Block-C' and i == 0:
                    s = priya
                else:
                    su = User.objects.create_user(f"student_{total_created}", f"stu{total_created}@campusiq.com", "pass_123")
                    s = Student.objects.create(
                        user=su,
                        roll_number=f"{random.choice(departments)}-2024-{1000+total_created}",
                        name=f"{random.choice(names)} {random.choice(names)}",
                        department=random.choice(departments),
                        year=random.choice([1, 2, 3, 4])
                    )
                    Profile.objects.create(user=su, role='student', linked_student=s)
                    students_list.append(s)
                    total_created += 1

                # Allocate room
                # Find an available room
                available_rooms = [r for r in rooms[block_name] if r[1] < 2]
                if available_rooms:
                    chosen_room, occ = available_rooms[0]
                    RoomAllocation.objects.create(
                        room=chosen_room,
                        student=s,
                        start_date=date(2024, 8, 1)
                    )
                    # update occupancy tracking
                    rooms[block_name].remove((chosen_room, occ))
                    rooms[block_name].append((chosen_room, occ + 1))


        self.stdout.write('Generating Behavioral & Academic Data...')
        today = date.today()
        # Priya Scenario
        # Dropping GPA
        AcademicRecord.objects.create(student=priya, semester=1, gpa=8.5, attendance_percentage=90, active_backlogs=0)
        AcademicRecord.objects.create(student=priya, semester=2, gpa=7.0, attendance_percentage=75, active_backlogs=1)
        AcademicRecord.objects.create(student=priya, semester=3, gpa=5.5, attendance_percentage=55, active_backlogs=3)
        
        # Behavioral Logging (Priya skipping mess, coming late)
        for i in range(1, 15):
            d = today - timedelta(days=i)
            # Mood check-ins
            MoodCheckin.objects.create(student=priya, date=d, mood_score=random.randint(1, 3), sleep_hours=random.uniform(3.5, 5.0), stress_level=random.randint(8, 10), notes="Feeling overwhelmed.")
            
            if i % 3 == 0:
                BehavioralLog.objects.create(student=priya, date=d, activity_type='Mess Skipped', severity='medium')
            if i % 4 == 0:
                BehavioralLog.objects.create(student=priya, date=d, activity_type='Curfew Violation/Late Entry', severity='high')
        
        RiskAssessment.objects.create(
            student=priya,
            total_risk_score=85.0,
            risk_level='critical',
            contributing_factors={"attendance_drop": 0.4, "mood_decline": 0.3, "mess_skips": 0.2, "backlogs": 0.1}
        )
        
        Alert.objects.create(
            student=priya, alert_type='high_risk_detected', message='Critical risk: Sharp GPA drop and continuous negative mood.', is_resolved=False
        )

        Intervention.objects.create(
            student=priya, counsellor=counsellor_user, status='pending', notes='Automated alert generated. Needs urgent attention.'
        )

        # For the rest of the ~50 students
        for s in students_list:
            if s == priya: continue
            
            # Mostly varied but normal data
            gpa = round(random.uniform(6.5, 9.8), 2)
            AcademicRecord.objects.create(student=s, semester=random.choice([1, 2, 3]), gpa=gpa, attendance_percentage=random.uniform(70, 98))
            
            # Some occasional random behavior
            if random.random() < 0.2:
                BehavioralLog.objects.create(student=s, date=today - timedelta(days=random.randint(1,10)), activity_type='Library Late', severity='low')
            
            MoodCheckin.objects.create(student=s, date=today, mood_score=random.randint(6, 10))
            
            # Assign fake risk score
            RiskAssessment.objects.create(
                student=s,
                total_risk_score=random.uniform(5.0, 35.0),
                risk_level='low',
            )

        self.stdout.write('Generating Resource Usage Details...')
        
        now = datetime.now()
        # Mess overload weekdays, low weekends
        for i in range(14):
            d = now - timedelta(days=i)
            is_weekend = d.weekday() >= 5
            # Mess
            qty = random.randint(30, 40) if is_weekend else random.randint(180, 220)
            ResourceUsage.objects.create(location='Main Mess', resource_type='mess', timestamp=d, quantity=qty)

            # Lab-3 Energy Spike at night
            # Usually low at night, but we inject a spike around 2 AM for a specific day or generally
            if i == 2:
                # Big spike
                night_time = d.replace(hour=2, minute=0)
                ResourceUsage.objects.create(location='Lab-3', resource_type='energy', timestamp=night_time, quantity=850.5)
            else:
                # Normal 2 AM usage
                night_time = d.replace(hour=2, minute=0)
                ResourceUsage.objects.create(location='Lab-3', resource_type='energy', timestamp=night_time, quantity=15.5)
            
            # Normal day usage
            day_time = d.replace(hour=14, minute=0)
            ResourceUsage.objects.create(location='Lab-3', resource_type='energy', timestamp=day_time, quantity=300.2)

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded database with {len(students_list)} students!'))
