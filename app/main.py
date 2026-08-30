import sys
import os

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.insert(0, backend_path)

# Clear root 'app' from sys.modules to prevent conflict and force a reload from the backend folder
for key in list(sys.modules.keys()):
    if key == 'app' or key.startswith('app.'):
        del sys.modules[key]

# Import the actual app from the backend folder
import app.main as backend_main
app = backend_main.app
