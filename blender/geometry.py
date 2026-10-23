"""Procedural models for the site: a honey jar, a honey dipper, a comb frame and a hive.

Sizes are in scene units where the jar is about 2.4 tall (the old code-built jar's size), so
the exported model drops into the same camera framing.
"""

import math
import random

import bmesh
import bpy

import common


def lathe(name, profile, segments=64, radius_at=None, closed=False):
    """Spin a (radius, height) profile around Z into a mesh object.

    Points with radius 0 become a single pole vertex. `radius_at(r, z, angle)` may bend the
    radius per vertex (for knurling). `closed` joins the last ring back to the first.
    """
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    rings = []
    for r, z in profile:
        if r == 0:
            rings.append([bm.verts.new((0, 0, z))])
            continue
        ring = []
        for i in range(segments):
            angle = 2 * math.pi * i / segments
            rr = radius_at(r, z, angle) if radius_at else r
            ring.append(bm.verts.new((rr * math.cos(angle), rr * math.sin(angle), z)))
        rings.append(ring)
    pairs = list(zip(rings, rings[1:]))
    if closed:
        pairs.append((rings[-1], rings[0]))
    for a, b in pairs:
        if len(a) == 1 and len(b) == 1:
            continue
        for i in range(segments):
            j = (i + 1) % segments
            if len(a) == 1:
                bm.faces.new((a[0], b[i], b[j]))
            elif len(b) == 1:
                bm.faces.new((a[i], a[j], b[0]))
            else:
                bm.faces.new((a[i], a[j], b[j], b[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    for poly in mesh.polygons:
        poly.use_smooth = True
    return obj


def subdivide(obj, levels=2, render_levels=None):
    modifier = obj.modifiers.new("Subdivision", "SUBSURF")
    modifier.levels = levels
    modifier.render_levels = render_levels if render_levels is not None else levels
    return modifier


# --- Jar -----------------------------------------------------------------------------------

GLASS_OUTER = [
    (0, -1.2),
    (0.66, -1.2),
    (0.76, -1.18),
    (0.8, -1.1),
    (0.8, 0.66),
    (0.78, 0.78),
    (0.68, 0.88),
    (0.57, 0.95),
    (0.555, 1.0),
    (0.555, 1.12),
    (0.535, 1.14),
]
GLASS_INNER = [
    (0.515, 1.13),
    (0.515, 1.0),
    (0.53, 0.94),
    (0.65, 0.86),
    (0.745, 0.76),
    (0.765, 0.64),
    (0.765, -1.04),
    (0.72, -1.1),
    (0.62, -1.115),
    (0, -1.115),
]

HONEY_LEVEL = 0.6


def honey_profile(level=HONEY_LEVEL, inset=0.006):
    r = 0.765 - inset
    return [
        (0, -1.115 + inset),
        (0.62, -1.115 + inset),
        (0.72 - inset, -1.1 + inset),
        (r, -1.04),
        (r, level + 0.025),
        # A meniscus: honey climbs the glass a little.
        (r - 0.03, level + 0.004),
        (r - 0.15, level),
        (0, level),
    ]


def knurl(count=90, depth=0.007, z_min=1.0, z_max=1.22):
    def radius_at(r, z, angle):
        if z_min <= z <= z_max:
            return r + depth * (0.5 + 0.5 * math.cos(count * angle))
        return r

    return radius_at


LID_PROFILE = [
    (0, 1.245),
    (0.5, 1.245),
    (0.575, 1.24),
    (0.6, 1.225),
    (0.605, 1.2),
    (0.605, 1.03),
    (0.595, 1.0),
    (0.575, 0.995),
    (0.575, 1.01),
    (0.56, 1.02),
    (0.56, 1.2),
    (0, 1.2),
]

LABEL_ARC = math.radians(150)


def label_mesh(name, z_min=-0.55, z_max=0.05, radius=0.803, segments=64, arc=LABEL_ARC):
    """A paper label wrapped round the front of the jar (facing -Y, towards the camera)."""
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    start = -math.pi / 2 - arc / 2
    bottom = []
    top = []
    for i in range(segments + 1):
        angle = start + arc * i / segments
        x, y = radius * math.cos(angle), radius * math.sin(angle)
        bottom.append(bm.verts.new((x, y, z_min)))
        top.append(bm.verts.new((x, y, z_max)))
    for i in range(segments):
        bm.faces.new((bottom[i], bottom[i + 1], top[i + 1], top[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    # Normals outwards.
    for face in bm.faces:
        if face.normal.dot(face.calc_center_median()) < 0:
            face.normal_flip()
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    for poly in mesh.polygons:
        poly.use_smooth = True
    solid = obj.modifiers.new("Thickness", "SOLIDIFY")
    solid.thickness = 0.004
    solid.offset = 1
    return obj


def label_material(paper="#e8d6b0", ink="#5a2e0c"):
    """Kraft paper with a printed hexagon and two rules, all procedural (renders only)."""
    material = common.principled("Label", Roughness=0.85)
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    coords = nodes.new("ShaderNodeTexCoord")
    sep = nodes.new("ShaderNodeSeparateXYZ")
    links.new(coords.outputs["Object"], sep.inputs[0])
    # Angle round the jar (0 at the front) and height, as a flat label space.
    script = nodes.new("ShaderNodeMath")
    script.operation = "ARCTAN2"
    links.new(sep.outputs["X"], script.inputs[0])
    neg_y = nodes.new("ShaderNodeMath")
    neg_y.operation = "MULTIPLY"
    neg_y.inputs[1].default_value = -1
    links.new(sep.outputs["Y"], neg_y.inputs[0])
    links.new(neg_y.outputs[0], script.inputs[1])
    u = nodes.new("ShaderNodeMath")
    u.operation = "MULTIPLY"
    u.inputs[1].default_value = 0.62
    links.new(script.outputs[0], u.inputs[0])
    combine = nodes.new("ShaderNodeCombineXYZ")
    links.new(u.outputs[0], combine.inputs["X"])
    v = nodes.new("ShaderNodeMath")
    v.operation = "SUBTRACT"
    v.inputs[1].default_value = -0.25
    links.new(sep.outputs["Z"], v.inputs[0])
    links.new(v.outputs[0], combine.inputs["Y"])
    # Hexagon outline: distance in a hexagonal norm, then a thin band.
    hexdist = nodes.new("ShaderNodeVectorMath")
    hexdist.operation = "ABSOLUTE"
    links.new(combine.outputs[0], hexdist.inputs[0])
    sx = nodes.new("ShaderNodeSeparateXYZ")
    links.new(hexdist.outputs[0], sx.inputs[0])
    a = nodes.new("ShaderNodeMath")
    a.operation = "MULTIPLY_ADD"
    a.inputs[1].default_value = 0.5
    links.new(sx.outputs["X"], a.inputs[0])
    b = nodes.new("ShaderNodeMath")
    b.operation = "MULTIPLY"
    b.inputs[1].default_value = 0.866
    links.new(sx.outputs["Y"], b.inputs[0])
    links.new(b.outputs[0], a.inputs[2])
    hexnorm = nodes.new("ShaderNodeMath")
    hexnorm.operation = "MAXIMUM"
    links.new(a.outputs[0], hexnorm.inputs[0])
    links.new(sx.outputs["Y"], hexnorm.inputs[1])
    band = nodes.new("ShaderNodeMath")
    band.operation = "SUBTRACT"
    band.inputs[1].default_value = 0.13
    links.new(hexnorm.outputs[0], band.inputs[0])
    absb = nodes.new("ShaderNodeMath")
    absb.operation = "ABSOLUTE"
    links.new(band.outputs[0], absb.inputs[0])
    line = nodes.new("ShaderNodeMath")
    line.operation = "LESS_THAN"
    line.inputs[1].default_value = 0.012
    links.new(absb.outputs[0], line.inputs[0])
    # Two rules near the top and bottom edges.
    zb = nodes.new("ShaderNodeMath")
    zb.operation = "SUBTRACT"
    zb.inputs[1].default_value = -0.25
    links.new(sep.outputs["Z"], zb.inputs[0])
    zabs = nodes.new("ShaderNodeMath")
    zabs.operation = "ABSOLUTE"
    links.new(zb.outputs[0], zabs.inputs[0])
    zr = nodes.new("ShaderNodeMath")
    zr.operation = "SUBTRACT"
    zr.inputs[1].default_value = 0.255
    links.new(zabs.outputs[0], zr.inputs[0])
    zra = nodes.new("ShaderNodeMath")
    zra.operation = "ABSOLUTE"
    links.new(zr.outputs[0], zra.inputs[0])
    rule = nodes.new("ShaderNodeMath")
    rule.operation = "LESS_THAN"
    rule.inputs[1].default_value = 0.008
    links.new(zra.outputs[0], rule.inputs[0])
    ink_mask = nodes.new("ShaderNodeMath")
    ink_mask.operation = "MAXIMUM"
    links.new(line.outputs[0], ink_mask.inputs[0])
    links.new(rule.outputs[0], ink_mask.inputs[1])
    mix = nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.inputs["A"].default_value = common.linear(paper)
    mix.inputs["B"].default_value = common.linear(ink)
    links.new(ink_mask.outputs[0], mix.inputs["Factor"])
    links.new(mix.outputs["Result"], nodes["Principled BSDF"].inputs["Base Color"])
    return material


def build_jar(honey_color=common.HONEY, honey_deep=common.HONEY_DEEP, density=2.2, segments=64,
              with_label=True, level=HONEY_LEVEL, for_export=False):
    """The jar as separate objects named Glass, Honey, Lid and Label. Returns them as a dict."""
    glass = lathe("Glass", GLASS_OUTER + GLASS_INNER, segments, closed=True)
    honey = lathe("Honey", honey_profile(level), segments)
    lid = lathe("Lid", LID_PROFILE, segments * 2 if not for_export else segments,
                radius_at=None if for_export else knurl())
    parts = {"Glass": glass, "Honey": honey, "Lid": lid}
    if with_label:
        parts["Label"] = label_mesh("Label", segments=segments)
    if not for_export:
        subdivide(glass, 1, 2)
        subdivide(honey, 1, 2)
        glass.data.materials.append(common.glass_material())
        honey.data.materials.append(common.honey_material(honey_color, honey_deep, density))
        lid.data.materials.append(common.metal_material())
        if with_label:
            parts["Label"].data.materials.append(label_material())
    return parts


# --- Honey dipper --------------------------------------------------------------------------

def build_dipper(length=3.2, honey=True):
    """A turned wooden honey dipper lying along +X from the origin (head at the origin)."""
    profile = [(0, -0.45)]
    # Head: four grooved rings.
    z = -0.45
    for i in range(4):
        profile += [(0.16, z), (0.27, z + 0.03), (0.28, z + 0.1), (0.27, z + 0.17), (0.16, z + 0.2)]
        z += 0.2
    profile += [(0.12, z + 0.02), (0.09, z + 0.2), (0.075, z + 0.6)]
    # Handle: a long taper to a turned knob.
    profile += [(0.07, length - 0.6), (0.085, length - 0.4), (0.06, length - 0.32),
                (0.075, length - 0.2), (0.06, length - 0.05), (0, length)]
    dipper = lathe("Dipper", profile, 48)
    subdivide(dipper, 1, 2)
    dipper.data.materials.append(common.wood_material())
    dipper.rotation_euler = (0, math.radians(90), 0)
    objects = [dipper]
    if honey:
        coat = lathe(
            "DipperHoney",
            [(0, -0.5), (0.24, -0.49), (0.31, -0.4), (0.33, -0.1), (0.32, 0.2), (0.29, 0.34),
             (0.2, 0.4), (0.12, 0.42), (0, 0.42)],
            48,
        )
        subdivide(coat, 2, 2)
        coat.data.materials.append(common.honey_material(density=1.6))
        coat.rotation_euler = (0, math.radians(90), 0)
        coat.location.z -= 0.02
        objects.append(coat)
    return objects


def drip(start, length, radius=0.07, name="Drip"):
    """A falling honey thread ending in a drop, hanging down from `start`."""
    x, y, z = start
    profile = [(0, 0.05), (radius * 1.6, 0.0), (radius, -0.15)]
    steps = 8
    for i in range(1, steps):
        t = i / steps
        profile.append((radius * (1 - 0.65 * t), -0.15 - t * (length - 0.4)))
    tail = -length + 0.25
    profile += [(radius * 0.55, tail), (radius * 2.0, tail - 0.1), (radius * 2.3, tail - 0.22),
                (radius * 1.6, tail - 0.34), (0, tail - 0.38)]
    obj = lathe(name, profile, 32)
    subdivide(obj, 1, 2)
    obj.location = (x, y, z)
    obj.data.materials.append(common.honey_material(density=1.4))
    return obj


# --- Comb frame ----------------------------------------------------------------------------

def hex_cell_ring(bm, cx, cy, outer, inner, z0, z1):
    """One open hexagonal cell: six thin walls between the outer and inner hexagon, z0..z1."""
    corners = []
    for k in range(6):
        angle = math.pi / 6 + k * math.pi / 3
        corners.append((math.cos(angle), math.sin(angle)))
    rings = []
    for radius, z in ((outer, z0), (outer, z1), (inner, z1), (inner, z0)):
        rings.append([bm.verts.new((cx + radius * c, cy + radius * s, z)) for c, s in corners])
    for a, b in zip(rings, rings[1:]):
        for k in range(6):
            n = (k + 1) % 6
            bm.faces.new((a[k], a[n], b[n], b[k]))


def build_comb(width=4.0, height=2.6, cell=0.11, depth=0.22, seed=5, fill=0.45, capped=0.1):
    """A sheet of comb with open cells on the front face, some holding honey, some capped.

    Returns (walls, honey, caps, foundation) objects. The sheet lies in XY, facing +Z.
    """
    rng = random.Random(seed)
    walls_mesh = bmesh.new()
    honey_mesh = bmesh.new()
    caps_mesh = bmesh.new()
    apothem = cell
    radius = apothem / math.cos(math.pi / 6)
    dx = 2 * apothem
    dy = 1.5 * radius
    rows = int(height / dy)
    cols = int(width / dx)
    wall = 0.012
    for row in range(rows):
        for col in range(cols):
            cx = -width / 2 + dx * (col + 0.5 * (row % 2)) + apothem
            cy = -height / 2 + dy * row + radius
            # A ragged, organic edge: the outer cells are drawn out less.
            edge = min(cx + width / 2, width / 2 - cx, cy + height / 2, height / 2 - cy)
            local_depth = depth * min(1.0, 0.35 + edge / 0.5) * rng.uniform(0.9, 1.0)
            hex_cell_ring(walls_mesh, cx, cy, radius, radius - wall / math.cos(math.pi / 6), 0,
                          local_depth)
            roll = rng.random()
            # Capped cells cluster towards the top, like a real frame.
            cap_bias = capped * (0.4 + 1.2 * (cy + height / 2) / height)
            if roll < cap_bias:
                bmesh.ops.create_circle(caps_mesh, cap_ends=True, segments=6,
                                        radius=radius - wall * 0.5,
                                        matrix=_cell_matrix(cx, cy, local_depth * 0.96))
            elif roll < cap_bias + fill:
                level = local_depth * rng.uniform(0.25, 0.7)
                bmesh.ops.create_circle(honey_mesh, cap_ends=True, segments=6,
                                        radius=radius - wall * 1.2,
                                        matrix=_cell_matrix(cx, cy, level))
    objects = []
    for name, bm, material in (
        ("CombWalls", walls_mesh, common.backlit_wax_material("#fae3a6", 0.7)),
        ("CombHoney", honey_mesh, common.cell_honey_material("#f5a524")),
        ("CombCaps", caps_mesh, common.backlit_wax_material("#f8e0a0", 0.35)),
    ):
        mesh = bpy.data.meshes.new(name)
        bm.to_mesh(mesh)
        bm.free()
        obj = bpy.data.objects.new(name, mesh)
        bpy.context.collection.objects.link(obj)
        obj.data.materials.append(material)
        objects.append(obj)
    # Domed caps and soft honey surfaces.
    for obj in objects[2:]:
        subdivide(obj, 1, 2)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0.001))
    foundation = bpy.context.active_object
    foundation.name = "Foundation"
    foundation.scale = (width, height, 1)
    foundation.data.materials.append(common.wax_material("#6b3a0c"))
    objects.append(foundation)
    return objects


def _cell_matrix(cx, cy, z):
    from mathutils import Euler, Matrix

    return Matrix.Translation((cx, cy, z)) @ Euler((0, 0, math.pi / 6)).to_matrix().to_4x4()


def build_frame(width=4.4, height=2.9, bar=0.12, top_extra=0.5):
    """A wooden frame around a comb: a top bar with lugs, two side bars and a bottom bar."""
    wood = common.wood_material(scale=3.0)
    parts = []
    specs = [
        ("TopBar", (0, height / 2 + bar / 2, 0.06), (width + 2 * top_extra, bar * 1.2, 0.24)),
        ("BottomBar", (0, -height / 2 - bar / 2, 0), (width, bar * 0.8, 0.3)),
        ("LeftBar", (-width / 2 - bar / 2, 0, 0.06), (bar, height + bar, 0.24)),
        ("RightBar", (width / 2 + bar / 2, 0, 0.06), (bar, height + bar, 0.24)),
    ]
    for name, location, size in specs:
        bpy.ops.mesh.primitive_cube_add(size=1, location=location)
        obj = bpy.context.active_object
        obj.name = name
        obj.scale = size
        bevel = obj.modifiers.new("Bevel", "BEVEL")
        bevel.width = 0.012
        bevel.segments = 2
        obj.data.materials.append(wood)
        parts.append(obj)
    return parts


# --- Hive ----------------------------------------------------------------------------------

def build_hive(boxes=3, width=1.6, depth=1.9, box_height=0.75, seed=9):
    """A stack of wooden hive boxes on a stand, with a gabled roof and an entrance slot."""
    rng = random.Random(seed)
    parts = []
    z = 0.35
    # Stand.
    for x in (-width / 2 + 0.1, width / 2 - 0.1):
        for y in (-depth / 2 + 0.1, depth / 2 - 0.1):
            bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, 0.175))
            leg = bpy.context.active_object
            leg.scale = (0.12, 0.12, 0.35)
            parts.append(leg)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, z + 0.04))
    board = bpy.context.active_object
    board.scale = (width + 0.15, depth + 0.35, 0.08)
    parts.append(board)
    z += 0.08
    tones = ["#9a6634", "#86552a", "#a8743d", "#7a4a22"]
    for i in range(boxes):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, z + box_height / 2))
        box = bpy.context.active_object
        box.name = f"Box{i}"
        box.scale = (width, depth, box_height - 0.012)
        bevel = box.modifiers.new("Bevel", "BEVEL")
        bevel.width = 0.015
        bevel.segments = 2
        box.data.materials.append(common.wood_material(rng.choice(tones), scale=2.0))
        parts.append(box)
        # Hand holds: a dark notch on the front.
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -depth / 2 - 0.004, z + box_height * 0.62))
        hold = bpy.context.active_object
        hold.scale = (0.36, 0.02, 0.07)
        hold.data.materials.append(common.principled("Shadow", Base_Color=common.linear("#1a0d05"), Roughness=0.9))
        z += box_height
    # Entrance slot on the bottom box.
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -depth / 2 - 0.005, 0.47))
    slot = bpy.context.active_object
    slot.scale = (width * 0.6, 0.02, 0.05)
    slot.data.materials.append(common.principled("Slot", Base_Color=(0.005, 0.003, 0.001, 1), Roughness=1))
    # Roof: a shallow gable overhanging the boxes.
    mesh = bpy.data.meshes.new("Roof")
    bm = bmesh.new()
    w = width / 2 + 0.18
    d = depth / 2 + 0.2
    h = 0.42
    v = [bm.verts.new(p) for p in (
        (-w, -d, z), (w, -d, z), (w, d, z), (-w, d, z), (0, -d, z + h), (0, d, z + h),
    )]
    for face in ((v[0], v[1], v[4]), (v[3], v[5], v[2]), (v[0], v[4], v[5], v[3]),
                 (v[1], v[2], v[5], v[4]), (v[0], v[3], v[2], v[1])):
        bm.faces.new(face)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    roof = bpy.data.objects.new("Roof", mesh)
    bpy.context.collection.objects.link(roof)
    solid = roof.modifiers.new("Thickness", "SOLIDIFY")
    solid.thickness = 0.05
    roof.data.materials.append(common.principled("RoofMetal", Base_Color=common.linear("#6d6255"),
                                                 Metallic=0.8, Roughness=0.45))
    parts.append(roof)
    stand_wood = common.wood_material("#5a3a1e", scale=2.0)
    for obj in parts[:5]:
        obj.data.materials.append(stand_wood)
    return parts
