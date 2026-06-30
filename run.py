#!/usr/bin/env python3
"""Start Transapp frontend (Next.js) and backend (FastAPI) together."""

from __future__ import annotations

import signal
import socket
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"

processes: list[subprocess.Popen[bytes]] = []

NEXT_BIN = FRONTEND_DIR / "node_modules" / "next" / "dist" / "bin" / "next"


def backend_python() -> Path:
    if sys.platform == "win32":
        venv_python = BACKEND_DIR / ".venv" / "Scripts" / "python.exe"
    else:
        venv_python = BACKEND_DIR / ".venv" / "bin" / "python"

    if venv_python.exists():
        return venv_python

    print(
        "Warning: backend/.venv not found. Using current Python.\n"
        "Create it with: cd backend && python -m venv .venv && pip install -r requirements.txt"
    )
    return Path(sys.executable)


def ensure_frontend_deps() -> bool:
    if NEXT_BIN.exists():
        return True

    print(
        "Error: frontend dependencies are missing or broken.\n"
        "Run: cd frontend && pnpm install\n"
        "Then start again with: python run.py",
        file=sys.stderr,
    )
    return False


def ensure_backend_deps() -> bool:
    python = backend_python()
    if python != Path(sys.executable):
        return True

    try:
        import uvicorn  # noqa: PLC0415
    except ImportError:
        print(
            "Error: backend dependencies are not installed.\n"
            "Run: cd backend && python -m venv .venv && .venv\\Scripts\\pip install -r requirements.txt",
            file=sys.stderr,
        )
        return False

    return True


def port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex(("127.0.0.1", port)) == 0


def ensure_ports_available() -> bool:
    busy: list[int] = []
    if port_in_use(8000):
        busy.append(8000)
    if port_in_use(3000):
        busy.append(3000)

    if not busy:
        return True

    ports = ", ".join(str(port) for port in busy)
    print(
        f"Error: port(s) {ports} already in use.\n"
        "Stop the old Transapp process (Ctrl+C), then run `python run.py` again.\n"
        "If pages still 404, delete frontend/.next and restart.",
        file=sys.stderr,
    )
    return False


def start_backend() -> subprocess.Popen[bytes]:
    python = backend_python()
    command = [
        str(python),
        "-m",
        "uvicorn",
        "app.main:app",
        # "--reload",
        "--host",
        "0.0.0.0",
        "--port",
        "8000",
    ]
    print("[backend] Starting FastAPI on http://localhost:8000")
    return subprocess.Popen(command, cwd=BACKEND_DIR)


def start_frontend() -> subprocess.Popen[bytes]:
    print("[frontend] Starting Next.js on http://localhost:3000")
    if sys.platform == "win32":
        return subprocess.Popen(
            "pnpm dev",
            cwd=FRONTEND_DIR,
            shell=True,
        )
    return subprocess.Popen(["pnpm", "dev"], cwd=FRONTEND_DIR)


def stop_all() -> None:
    for process in processes:
        if process.poll() is None:
            process.terminate()

    deadline = time.time() + 5
    for process in processes:
        while process.poll() is None and time.time() < deadline:
            time.sleep(0.1)
        if process.poll() is None:
            process.kill()


def on_signal(signum: int, _frame: object) -> None:
    print(f"\nReceived signal {signum}. Stopping services...")
    stop_all()
    sys.exit(0)


def main() -> int:
    if not FRONTEND_DIR.is_dir():
        print("Error: frontend/ directory not found.", file=sys.stderr)
        return 1
    if not BACKEND_DIR.is_dir():
        print("Error: backend/ directory not found.", file=sys.stderr)
        return 1

    if not ensure_frontend_deps():
        return 1
    if not ensure_backend_deps():
        return 1
    if not ensure_ports_available():
        return 1

    signal.signal(signal.SIGINT, on_signal)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, on_signal)

    processes.append(start_backend())
    time.sleep(1)
    processes.append(start_frontend())

    print("\nTransapp is running.")
    print("  Frontend: http://localhost:3000")
    print("  Backend:  http://localhost:8000")
    print("  API docs: http://localhost:8000/docs")
    print("Press Ctrl+C to stop both.\n")

    try:
        while True:
            for process in processes:
                if process.poll() is not None:
                    print("A service exited unexpectedly. Stopping the other...")
                    stop_all()
                    return process.returncode or 1
            time.sleep(0.5)
    except KeyboardInterrupt:
        on_signal(signal.SIGINT, None)
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
