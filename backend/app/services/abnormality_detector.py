"""
Abnormality Detection Engine
============================
Core rule-based multi-tier clinical threshold evaluation service with integrated ML extension point.
Evaluates incoming vitals against configurable boundaries and generates actionable diagnostic explanations and alert triggers.

NOTE: Prototype/Simulation thresholds for educational and demonstration purposes only. Not for real medical diagnosis.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import copy
from app.core.config import settings

class AbnormalityDetector:
    def __init__(self, custom_thresholds: Optional[Dict[str, Any]] = None):
        self.thresholds = copy.deepcopy(settings.DEFAULT_THRESHOLDS)
        if custom_thresholds:
            self.update_thresholds(custom_thresholds)

    def update_thresholds(self, new_thresholds: Dict[str, Any]):
        """Dynamically update threshold values at runtime."""
        for metric, conf in new_thresholds.items():
            if metric in self.thresholds and isinstance(conf, dict):
                self.thresholds[metric].update(conf)

    def get_thresholds(self) -> Dict[str, Any]:
        return copy.deepcopy(self.thresholds)

    def evaluate(self, reading_data: Dict[str, Any], patient_baselines: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Evaluates a set of physiological readings against multi-tier thresholds.
        Returns:
            overall_status: NORMAL, WARNING, CRITICAL
            severity_score: 0 (Normal), 1 (Warning), 2 (Critical)
            issues_detected: List of readable issue explanations
            parameter_evaluations: Per-parameter breakdown
            recommendation: Clinical action recommendation
            ml_insights: Machine learning anomaly prediction
            generated_alerts: List of structured alert definitions
        """
        issues: List[str] = []
        param_status: Dict[str, Dict[str, Any]] = {}
        highest_severity = 0  # 0: Normal, 1: Warning, 2: Critical
        generated_alerts: List[Dict[str, Any]] = []

        current_thresholds = self.get_thresholds()
        if patient_baselines:
            for metric, conf in patient_baselines.items():
                if metric in current_thresholds and isinstance(conf, dict):
                    current_thresholds[metric].update(conf)

        # 1. Heart Rate Evaluation
        hr = reading_data.get("heart_rate")
        if hr is not None:
            hr_conf = current_thresholds["heart_rate"]
            hr_status = "NORMAL"
            hr_msg = None

            if hr > hr_conf["critical_high"]:
                hr_status = "CRITICAL"
                hr_msg = f"Severe Tachycardia: Heart rate {hr:.1f} {hr_conf['unit']} exceeds critical high threshold ({hr_conf['critical_high']})"
                highest_severity = max(highest_severity, 2)
            elif hr < hr_conf["critical_low"]:
                hr_status = "CRITICAL"
                hr_msg = f"Severe Bradycardia: Heart rate {hr:.1f} {hr_conf['unit']} is below critical low threshold ({hr_conf['critical_low']})"
                highest_severity = max(highest_severity, 2)
            elif hr > hr_conf["warning_high"]:
                hr_status = "WARNING"
                hr_msg = f"Elevated Heart Rate: {hr:.1f} {hr_conf['unit']} exceeds warning threshold ({hr_conf['warning_high']})"
                highest_severity = max(highest_severity, 1)
            elif hr < hr_conf["warning_low"]:
                hr_status = "WARNING"
                hr_msg = f"Low Heart Rate: {hr:.1f} {hr_conf['unit']} is below warning threshold ({hr_conf['warning_low']})"
                highest_severity = max(highest_severity, 1)

            param_status["heart_rate"] = {
                "value": hr,
                "unit": hr_conf["unit"],
                "status": hr_status,
                "message": hr_msg
            }
            if hr_msg:
                issues.append(hr_msg)
                generated_alerts.append({
                    "parameter": "heart_rate",
                    "value": hr,
                    "threshold_violated": f"Critical > {hr_conf['critical_high']} or Warning > {hr_conf['warning_high']}",
                    "severity": hr_status,
                    "title": f"{hr_status} Heart Rate Alert",
                    "message": hr_msg
                })

        # 2. SpO2 Oxygen Saturation Evaluation
        spo2 = reading_data.get("spo2")
        if spo2 is not None:
            spo2_conf = current_thresholds["spo2"]
            spo2_status = "NORMAL"
            spo2_msg = None

            if spo2 <= spo2_conf["critical_low"]:
                spo2_status = "CRITICAL"
                spo2_msg = f"Severe Hypoxemia: SpO2 oxygen saturation dropped to {spo2:.1f}{spo2_conf['unit']} (Critical <= {spo2_conf['critical_low']})"
                highest_severity = max(highest_severity, 2)
            elif spo2 <= spo2_conf["warning_high"] and spo2 >= spo2_conf["warning_low"]:
                spo2_status = "WARNING"
                spo2_msg = f"Low Oxygen Saturation: SpO2 {spo2:.1f}{spo2_conf['unit']} is below normal target (95%)"
                highest_severity = max(highest_severity, 1)

            param_status["spo2"] = {
                "value": spo2,
                "unit": spo2_conf["unit"],
                "status": spo2_status,
                "message": spo2_msg
            }
            if spo2_msg:
                issues.append(spo2_msg)
                generated_alerts.append({
                    "parameter": "spo2",
                    "value": spo2,
                    "threshold_violated": f"Critical <= {spo2_conf['critical_low']} or Warning <= {spo2_conf['warning_high']}",
                    "severity": spo2_status,
                    "title": f"{spo2_status} SpO2 Desaturation Alert",
                    "message": spo2_msg
                })

        # 3. Body Temperature Evaluation
        temp = reading_data.get("temperature")
        if temp is not None:
            temp_conf = current_thresholds["temperature"]
            temp_status = "NORMAL"
            temp_msg = None

            if temp >= temp_conf["critical_high"]:
                temp_status = "CRITICAL"
                temp_msg = f"Hyperpyrexia / High Fever: Temperature {temp:.1f}{temp_conf['unit']} exceeds critical limit ({temp_conf['critical_high']})"
                highest_severity = max(highest_severity, 2)
            elif temp <= temp_conf["critical_low"]:
                temp_status = "CRITICAL"
                temp_msg = f"Severe Hypothermia: Temperature {temp:.1f}{temp_conf['unit']} is below critical limit ({temp_conf['critical_low']})"
                highest_severity = max(highest_severity, 2)
            elif temp >= temp_conf["warning_high"]:
                temp_status = "WARNING"
                temp_msg = f"Mild Pyrexia / Elevated Temperature: {temp:.1f}{temp_conf['unit']} exceeds warning threshold ({temp_conf['warning_high']})"
                highest_severity = max(highest_severity, 1)
            elif temp <= temp_conf["warning_low"]:
                temp_status = "WARNING"
                temp_msg = f"Mild Hypothermia: {temp:.1f}{temp_conf['unit']} is below warning threshold ({temp_conf['warning_low']})"
                highest_severity = max(highest_severity, 1)

            param_status["temperature"] = {
                "value": temp,
                "unit": temp_conf["unit"],
                "status": temp_status,
                "message": temp_msg
            }
            if temp_msg:
                issues.append(temp_msg)
                generated_alerts.append({
                    "parameter": "temperature",
                    "value": temp,
                    "threshold_violated": f"Critical >= {temp_conf['critical_high']} or Warning >= {temp_conf['warning_high']}",
                    "severity": temp_status,
                    "title": f"{temp_status} Temperature Alert",
                    "message": temp_msg
                })

        # Overall Status String
        status_map = {0: "NORMAL", 1: "WARNING", 2: "CRITICAL"}
        overall_status = status_map[highest_severity]

        # Recommendation Generation
        if overall_status == "CRITICAL":
            recommendation = "IMMEDIATE ATTENTION REQUIRED: Initiate emergency bedside clinical triage and check supplemental oxygen."
        elif overall_status == "WARNING":
            recommendation = "MONITOR CLOSELY: Observe trend velocity over next 15 minutes and verify sensor probe placement."
        else:
            recommendation = "STABLE: Patient physiological vitals within nominal target baseline."
        return {
            "overall_status": overall_status,
            "severity_score": highest_severity,
            "issues_detected": issues,
            "parameters_status": param_status,
            "recommendation": recommendation,
            "generated_alerts": generated_alerts,
            "timestamp": datetime.now(timezone.utc)
        }

# Global instance
abnormality_detector = AbnormalityDetector()
