import frappe

frappe.init(site="lms.localhost")
frappe.connect()

lesson_path = "/home/frappe/frappe-bench/apps/lms/lms/lms/doctype/course_lesson/course_lesson.py"
try:
    with open(lesson_path, "r") as f:
        content = f.read()

    if "Allow read/select/print for all users" in content:
        print("Already patched.")
    else:
        lines = content.splitlines()
        new_lines = []
        in_has_perm = False
        
        for line in lines:
            if line.startswith("def has_permission("):
                in_has_perm = True
                new_lines.append("def has_permission(doc, ptype=\"read\", user=None):")
                new_lines.append("        user = user or frappe.session.user")
                new_lines.append("        if ptype not in (\"read\", \"select\", \"print\"):")
                new_lines.append("                roles = frappe.get_roles(user)")
                new_lines.append("                if \"Moderator\" in roles or \"Course Creator\" in roles:")
                new_lines.append("                        return True")
                new_lines.append("                return can_access_lesson(doc.name, instructor_only=True, user=user)")
                new_lines.append("        # Allow read/select/print for all users (including Guest) to allow student page viewing")
                new_lines.append("        return True")
                continue
                
            if in_has_perm:
                # If we are inside the function and hit a non-empty, non-indented line, we've left the function
                if line.strip() != "" and not line.startswith(" ") and not line.startswith("\t"):
                    in_has_perm = False
                else:
                    continue
            
            new_lines.append(line)
            
        with open(lesson_path, "w") as f:
            f.write("\n".join(new_lines) + "\n")
        print("Successfully patched has_permission in course_lesson.py!")
except Exception as e:
    print("Error patching course_lesson.py:", e)





