import io
import json
import os

def json_file_check(filename):
    if os.path.isfile(f"./{filename}") and os.access(f"./{filename}", os.R_OK):
        print (f"{filename} exists and is readable")
        return True
    else:
        print (f"Either {filename} is missing or is not readable, creating {filename}...")
        with io.open(os.path.join('.', f"{filename}"), 'w') as file:
            file.write(json.dumps({}))
        return False
