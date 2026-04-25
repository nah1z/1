Attribute VB_Name = "CoupleBudget"
Option Explicit

' =============================================================================
' 情侶共同基金記帳工具 — VBA 巨集
'
' 用法：
'   1. 把 couple-budget-template.xlsx 另存為 .xlsm（啟用巨集的活頁簿）。
'   2. Alt + F11 開啟 VBA 編輯器，File → Import File... 匯入此 .bas 檔。
'   3. 在「快速記帳」工作表插入兩個按鈕，分別指派 AddTransaction 與 AddBudget。
'   4. 填好黃色輸入區後按按鈕即可。
'
' 提供的巨集：
'   AddTransaction  從「快速記帳」B3:B9 讀輸入，append 到「交易」工作表
'   AddBudget       從「快速記帳」E3:E7 讀輸入，append 到「預算」工作表
'   ResetStatusBar  內部使用，恢復狀態列
' =============================================================================

Public Sub AddTransaction()
    Dim wsInput As Worksheet, wsTx As Worksheet
    Set wsInput = ThisWorkbook.Worksheets("快速記帳")
    Set wsTx = ThisWorkbook.Worksheets("交易")

    Dim vDate As Variant, sFund As String, sType As String
    Dim sName As String, vAmount As Variant, sBy As String, sNote As String

    vDate = wsInput.Range("B4").Value
    sFund = Trim$(CStr(wsInput.Range("B5").Value))
    sType = Trim$(CStr(wsInput.Range("B6").Value))
    sName = Trim$(CStr(wsInput.Range("B7").Value))
    vAmount = wsInput.Range("B8").Value
    sBy = Trim$(CStr(wsInput.Range("B9").Value))
    sNote = Trim$(CStr(wsInput.Range("B10").Value))

    If Not IsDate(vDate) Then
        MsgBox "請輸入有效的日期（B4）", vbExclamation, "新增交易失敗"
        Exit Sub
    End If
    If Len(sFund) = 0 Then
        MsgBox "請選擇基金（B5）", vbExclamation, "新增交易失敗"
        Exit Sub
    End If
    If sType <> "收入" And sType <> "支出" Then
        MsgBox "類型必須是「收入」或「支出」（B6）", vbExclamation, "新增交易失敗"
        Exit Sub
    End If
    If Len(sName) = 0 Then
        MsgBox "請輸入項目名稱（B7）", vbExclamation, "新增交易失敗"
        Exit Sub
    End If
    If Not IsNumeric(vAmount) Or CDbl(vAmount) <= 0 Then
        MsgBox "請輸入大於 0 的金額（B8）", vbExclamation, "新增交易失敗"
        Exit Sub
    End If

    Dim r As Long: r = NextEmptyRow(wsTx, 1, 5)
    wsTx.Cells(r, 1).Value = CDate(vDate)
    wsTx.Cells(r, 1).NumberFormat = "yyyy-mm-dd"
    wsTx.Cells(r, 2).Value = sFund
    wsTx.Cells(r, 3).Value = sType
    wsTx.Cells(r, 4).Value = sName
    wsTx.Cells(r, 5).Value = CDbl(vAmount)
    wsTx.Cells(r, 6).Value = sBy
    wsTx.Cells(r, 7).Value = sNote

    wsInput.Range("B7:B8").ClearContents
    wsInput.Range("B10").ClearContents

    FlashStatus "已新增交易：" & Format(vDate, "yyyy-mm-dd") & _
                "  " & sFund & "  " & sType & "  " & sName & "  $" & vAmount
End Sub


Public Sub AddBudget()
    Dim wsInput As Worksheet, wsBg As Worksheet
    Set wsInput = ThisWorkbook.Worksheets("快速記帳")
    Set wsBg = ThisWorkbook.Worksheets("預算")

    Dim sFund As String, sMonth As String
    Dim vAmount As Variant, sBy As String, sNote As String

    sFund = Trim$(CStr(wsInput.Range("E4").Value))
    sMonth = Trim$(CStr(wsInput.Range("E5").Value))
    vAmount = wsInput.Range("E6").Value
    sBy = Trim$(CStr(wsInput.Range("E7").Value))
    sNote = Trim$(CStr(wsInput.Range("E8").Value))

    If Len(sFund) = 0 Then
        MsgBox "請選擇基金（E4）", vbExclamation, "新增預算失敗"
        Exit Sub
    End If
    If Not (sMonth Like "####-##") Then
        MsgBox "月份格式須為 YYYY-MM，例如 2026-04（E5）", vbExclamation, "新增預算失敗"
        Exit Sub
    End If
    If Not IsNumeric(vAmount) Or CDbl(vAmount) <= 0 Then
        MsgBox "請輸入大於 0 的金額（E6）", vbExclamation, "新增預算失敗"
        Exit Sub
    End If

    Dim r As Long: r = NextEmptyRow(wsBg, 1, 5)
    wsBg.Cells(r, 1).Value = sFund
    wsBg.Cells(r, 2).Value = sMonth
    wsBg.Cells(r, 3).Value = CDbl(vAmount)
    wsBg.Cells(r, 4).Value = sBy
    wsBg.Cells(r, 5).Value = sNote

    wsInput.Range("E6").ClearContents
    wsInput.Range("E8").ClearContents

    FlashStatus "已新增預算：" & sFund & "  " & sMonth & "  $" & vAmount
End Sub


' 找指定欄第一個空白列，從 startRow 開始
Private Function NextEmptyRow(ws As Worksheet, col As Long, startRow As Long) As Long
    Dim r As Long: r = startRow
    Do While Len(Trim$(CStr(ws.Cells(r, col).Value))) > 0
        r = r + 1
    Loop
    NextEmptyRow = r
End Function


Private Sub FlashStatus(msg As String)
    Application.StatusBar = msg
    Application.OnTime Now + TimeValue("00:00:03"), "ResetStatusBar"
End Sub


Public Sub ResetStatusBar()
    Application.StatusBar = False
End Sub
