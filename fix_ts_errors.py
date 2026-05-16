fixes = [
    ('views/CoordinatorReport.tsx', 437,
     '                                const branchSubjects = usedSubjectIds.map(sid => {\n',
     '                                const branchSubjects = (usedSubjectIds as string[]).map(sid => {\n'),
    ('views/Faculty.tsx', 589,
     '                                 const branchSubjects = usedSubjectIds.map(sid => {\n',
     '                                 const branchSubjects = (usedSubjectIds as string[]).map(sid => {\n'),
]

for filepath, lineno, old, new in fixes:
    with open(filepath, 'r') as f:
        lines = f.readlines()
    idx = lineno - 1
    if lines[idx] == old:
        lines[idx] = new
        with open(filepath, 'w') as f:
            f.writelines(lines)
        print(f'Fixed {filepath} line {lineno}')
    else:
        print(f'NO MATCH in {filepath} line {lineno}: {repr(lines[idx])}')
