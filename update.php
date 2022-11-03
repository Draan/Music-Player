<?php
	$data1 = json_encode($_POST); // uuugh objects vs array vs suck my balls
	$data2 = stripslashes($data1);
	$data2 = stripslashes($data2);
	$data3 = substr($data2, 6, strlen($data2)-8);
	file_put_contents('data.txt', $data3);
?>