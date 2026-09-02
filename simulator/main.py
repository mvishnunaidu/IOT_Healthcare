"""
Standalone IoT Simulator Runner
===============================
Usage:
    python -m simulator.main --patient 1 --mode NORMAL --interval 3
"""

import argparse
import time
import sys
import os

# Ensure parent directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from simulator.virtual_device import VirtualIoTDevice

def main():
    parser = argparse.ArgumentParser(description="Standalone IoT Healthcare Simulator")
    parser.add_argument("--patient", type=int, default=1, help="Patient ID")
    parser.add_argument("--mode", type=str, default="NORMAL", choices=["NORMAL", "WARNING", "CRITICAL"], help="Simulation Mode")
    parser.add_argument("--interval", type=float, default=3.0, help="Sampling interval in seconds")
    parser.add_argument("--url", type=str, default="http://127.0.0.1:8000/api/readings", help="Backend API URL")

    args = parser.parse_args()
    device = VirtualIoTDevice(device_id="ESP32_VIRTUAL_CLI", backend_url=args.url)

    print(f"==================================================")
    print(f"  Virtual IoT Healthcare Transmitter Running")
    print(f"  Patient ID: {args.patient} | Mode: {args.mode}")
    print(f"  Interval:   {args.interval}s | Target: {args.url}")
    print(f"==================================================")
    print("Press Ctrl+C to terminate transmission.\n")

    packet_count = 0
    try:
        while True:
            packet_count += 1
            result = device.sample_and_transmit(patient_id=args.patient, scenario=args.mode)
            print(f"[Packet #{packet_count}] Transmitted -> Status: {result.get('status')}")
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\nSimulator stopped by user.")

if __name__ == "__main__":
    main()
