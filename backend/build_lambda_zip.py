import os
import zipfile

def build_zip():
    zip_path = "lambda_function.zip"
    if os.path.exists(zip_path):
        try:
            os.remove(zip_path)
            print(f"Removed old {zip_path}")
        except Exception as e:
            print(f"Warning removing {zip_path}: {e}")

    print(f"Building fresh {zip_path}...")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # Add packages from package/ directory
        pkg_dir = "package"
        if os.path.exists(pkg_dir):
            for root, dirs, files in os.walk(pkg_dir):
                for file in files:
                    full_path = os.path.join(root, file)
                    arc_path = os.path.relpath(full_path, pkg_dir)
                    zf.write(full_path, arc_path)

        # Add backend source python files & directories (overwriting package if needed)
        sources = [
            "main.py", "models.py", "schemas.py", "auth.py", "database.py", "handler.py"
        ]
        for src in sources:
            if os.path.exists(src):
                print(f"Adding source: {src}")
                zf.write(src, src)

        for folder in ["routers", "utils"]:
            if os.path.exists(folder):
                for root, dirs, files in os.walk(folder):
                    for file in files:
                        if not file.endswith(".pyc") and "__pycache__" not in root:
                            full_path = os.path.join(root, file)
                            print(f"Adding folder file: {full_path}")
                            zf.write(full_path, full_path)

    size_mb = os.path.getsize(zip_path) / (1024 * 1024)
    print(f"[SUCCESS] Built {zip_path} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    build_zip()
