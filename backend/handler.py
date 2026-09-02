from mangum import Mangum
from main import app

# Mangum ASGI Handler for AWS Lambda + API Gateway / Function URL
handler = Mangum(app, lifespan="off")
