<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; }
        h1 { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Laporan Data Siswa</h1>
    <table>
        <thead>
            <tr>
                <th>NISN</th>
                <th>Nama</th>
                <th>L/P</th>
                <th>No HP</th>
            </tr>
        </thead>
        <tbody>
            @foreach($students as $student)
            <tr>
                <td>{{ $student->nisn }}</td>
                <td>{{ $student->name }}</td>
                <td>{{ $student->gender }}</td>
                <td>{{ $student->phone }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>