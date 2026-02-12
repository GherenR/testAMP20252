$path = 'c:\Users\user\testAMP20252\src\admin\tryouts.tsx'
$lines = Get-Content $path

# Fix Tipe Soal onClick
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'onClick=\{\(\) => setManualForm\(\{ \.\.\.manualForm, tipe_soal: t\.id as any \}\)\}') {
        $lines[$i] = '                                                                 onClick={() => setManualForm({
                                                                     ...manualForm,
                                                                     tipe_soal: t.id as any,
                                                                     opsi: t.id === "benar_salah" ? ["", "", ""] : (t.id === "isian" ? [] : ["", "", "", "", ""]),
                                                                     jawaban_kompleks: t.id === "isian" ? "" : (t.id === "pg_kompleks" || t.id === "benar_salah" ? [] : null)
                                                                 })}'
    }
}

# Fix Pertanyaan Indentation (lines 1175-1183 area)
# 1175: 52 spaces <div>
# 1176: 56 spaces <label>
# We want them at 48 and 52 respectively.
for ($i = 1170; $i -lt 1190; $i++) {
    if ($lines[$i] -match '^\s+<div>' -and $i -eq 1174) {
        $lines[$i] = '                                                <div>'
    }
    if ($lines[$i] -match '^\s+<label.*Pertanyaan' -and $i -eq 1175) {
        $lines[$i] = '                                                    <label className="block text-sm font-bold text-slate-700 mb-1">Pertanyaan</label>'
    }
    if ($lines[$i] -match '^\s+<textarea' -and $i -eq 1176) {
        $lines[$i] = '                                                    <textarea'
    }
    if ($lines[$i] -match '^\s+className="w-full' -and $i -eq 1177) {
        $lines[$i] = '                                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"'
    }
    if ($lines[$i] -match '^\s+placeholder="Tulis' -and $i -eq 1178) {
        $lines[$i] = '                                                        placeholder="Tulis pertanyaan di sini..."'
    }
    if ($lines[$i] -match '^\s+value=\{manualForm\.pertanyaan\}' -and $i -eq 1179) {
        $lines[$i] = '                                                        value={manualForm.pertanyaan}'
    }
    if ($lines[$i] -match '^\s+onChange=\{e => setManualForm' -and $i -eq 1180) {
        $lines[$i] = '                                                        onChange={e => setManualForm({ ...manualForm, pertanyaan: e.target.value })}'
    }
    if ($lines[$i] -match '^\s+/>' -and $i -eq 1181) {
        $lines[$i] = '                                                    />'
    }
    if ($lines[$i] -match '^\s+</div>' -and $i -eq 1182) {
        $lines[$i] = '                                                </div>'
    }
}

# Fix End of File Syntax (lines 1374-1375)
$lines[1373] = '                                        )}'
$lines[1374] = '                                    </div>' # Indented correctly for 1117

$lines | Set-Content $path -Encoding UTF8
