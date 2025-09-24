import traceback
from database import engine
from models import Base

try:
    Base.metadata.create_all(bind=engine)
    print('Database created successfully')
except Exception as e:
    print(f'Error: {e}')
    traceback.print_exc()
