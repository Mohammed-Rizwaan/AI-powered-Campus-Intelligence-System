from django.core.management.base import BaseCommand
from core.engine import run_risk_engine_for_all

class Command(BaseCommand):
    help = 'Executes the AI Risk Engine to statically compute risk score (0-100) exactly as in the rules, build explanations, update Student records, and conditionally trigger Alerts/Interventions.'

    def handle(self, *args, **kwargs):
        self.stdout.write('Initializing CampusIQ AI Risk Engine...')
        run_risk_engine_for_all()
        self.stdout.write(self.style.SUCCESS(f'Successfully computed risk and resolved factor analysis.'))
