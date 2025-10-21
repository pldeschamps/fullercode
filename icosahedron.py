import math

# Given data
lat_china = math.radians(39.1)
lon_china = math.radians(122.3)
lat_norway = math.radians(64.7)

# Desired angle between them
theta = math.acos(1 / math.sqrt(5))

# Compute cos(delta_longitude)
cos_dlon = (math.cos(theta) - math.sin(lat_china) * math.sin(lat_norway)) / (math.cos(lat_china) * math.cos(lat_norway))

# Clamp to [-1, 1] to avoid floating errors
cos_dlon = max(-1, min(1, cos_dlon))

# Two possible longitudes
delta_lon = math.acos(cos_dlon)
lon_norway_1 = lon_china + delta_lon
lon_norway_2 = lon_china - delta_lon

# Convert to degrees (normalize between -180,180)
def normalize(deg):
    deg = math.degrees(deg)
    while deg > 180: deg -= 360
    while deg < -180: deg += 360
    return deg

lon1 = normalize(lon_norway_1)
lon2 = normalize(lon_norway_2)

print(f"Possible NORWAY longitudes:")
print(f"  λ₁ = {lon1:.16f}°")
print(f"  λ₂ = {lon2:.16f}°")