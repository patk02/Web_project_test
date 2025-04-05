<?php
// เชื่อมต่อกับฐานข้อมูล
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "sport_booking";

// สร้างการเชื่อมต่อ
$conn = new mysqli($servername, $username, $password, $dbname);

// ตรวจสอบการเชื่อมต่อ
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// รับข้อมูลจากการส่งแบบ POST
$data = json_decode(file_get_contents("php://input"), true);

$field = $data['field'];
$date = $data['date'];
$start_time = $data['start_time'];
$hours = $data['hours'];

// สร้างคำสั่ง SQL สำหรับบันทึกข้อมูล
$sql = "INSERT INTO bookings (field, booking_date, start_time, hours) 
        VALUES ('$field', '$date', '$start_time', '$hours')";

// ตรวจสอบและดำเนินการบันทึกข้อมูล
if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => "success", "message" => "จองสนามสำเร็จ"]);
} else {
    echo json_encode(["status" => "error", "message" => "เกิดข้อผิดพลาด: " . $conn->error]);
}

// ปิดการเชื่อมต่อ
$conn->close();
?>
