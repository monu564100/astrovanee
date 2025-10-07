-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 22, 2025 at 03:54 PM
-- Server version: 10.4.21-MariaDB
-- PHP Version: 7.3.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `astro`
--

-- --------------------------------------------------------

--
-- Table structure for table `community`
--

CREATE TABLE `community` (
  `id` int(50) NOT NULL,
  `name` varchar(70) NOT NULL,
  `photo` varchar(250) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `whatsapp` varchar(15) NOT NULL,
  `gender` varchar(30) NOT NULL,
  `email` varchar(60) NOT NULL,
  `age` varchar(10) NOT NULL,
  `category` varchar(50) NOT NULL,
  `skills` varchar(200) NOT NULL,
  `experience` varchar(250) NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `city` varchar(100) NOT NULL,
  `reason` varchar(200) NOT NULL,
  `state` varchar(250) NOT NULL,
  `language` varchar(150) NOT NULL,
  `joineddate` varchar(80) NOT NULL,
  `status` varchar(40) NOT NULL,
  `consultation` varchar(50) NOT NULL,
  `accountholder` varchar(80) NOT NULL,
  `accountno` varchar(50) NOT NULL,
  `ifsc` varchar(50) NOT NULL,
  `availability` varchar(15) NOT NULL,
  `target` varchar(25) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `priceperminute` varchar(15) NOT NULL,
  `25minrate` varchar(10) NOT NULL,
  `30minrate` varchar(10) NOT NULL,
  `45minrate` varchar(10) NOT NULL,
  `1hourrate` varchar(10) NOT NULL,
  `90minrate` varchar(10) NOT NULL,
  `15minrate` varchar(10) NOT NULL,
  `about` text NOT NULL,
  `reasoncomment` longtext NOT NULL,
  `documentstatus` varchar(50) NOT NULL,
  `rating` varchar(5) NOT NULL,
  `onboardingstatus` varchar(60) NOT NULL,
  `otpverification` varchar(15) NOT NULL,
  `interviewerid` varchar(50) NOT NULL,
  `interviewcode` varchar(80) NOT NULL,
  `agreement` varchar(250) NOT NULL,
  `agreementuploaddate` varchar(100) NOT NULL,
  `approvedby` varchar(50) NOT NULL,
  `chatstatus` varchar(20) NOT NULL,
  `callstatus` varchar(20) NOT NULL,
  `bookingcount` varchar(5) NOT NULL,
  `agree` varchar(10) NOT NULL,
  `paymentdetails` varchar(10) NOT NULL,
  `token` varchar(255) NOT NULL,
  `redflag` varchar(10) NOT NULL,
  `freebooking` int(10) NOT NULL,
  `remainingfreebooking` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `community`
--

INSERT INTO `community` (`id`, `name`, `photo`, `phone`, `whatsapp`, `gender`, `email`, `age`, `category`, `skills`, `experience`, `pincode`, `city`, `reason`, `state`, `language`, `joineddate`, `status`, `consultation`, `accountholder`, `accountno`, `ifsc`, `availability`, `target`, `otp`, `priceperminute`, `25minrate`, `30minrate`, `45minrate`, `1hourrate`, `90minrate`, `15minrate`, `about`, `reasoncomment`, `documentstatus`, `rating`, `onboardingstatus`, `otpverification`, `interviewerid`, `interviewcode`, `agreement`, `agreementuploaddate`, `approvedby`, `chatstatus`, `callstatus`, `bookingcount`, `agree`, `paymentdetails`, `token`, `redflag`, `freebooking`, `remainingfreebooking`) VALUES
(85, 'Magic Square', 'photo.png', '9667356174', '9667356174', 'Male', 'sagarchandola0@gmail.com', '27', 'Astrologer', 'Astrology', '5 Years', '110086', '', 'Not getting enough clients', 'Delhi', 'Hindi, English', '10 October 2024', 'active', '', '', '', '', '', '', '', '50', '230', '250', '280', '350', '400', '500', '', '', '', '5', '', 'yes', '', '', '', '', '', 'online', 'offline', '', '', '', '', '0', 5, 5);

-- --------------------------------------------------------

--
-- Table structure for table `consultation`
--

CREATE TABLE `consultation` (
  `id` int(1) NOT NULL,
  `customerid` varchar(50) NOT NULL,
  `name` varchar(80) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `birthdate` varchar(50) NOT NULL,
  `birthtime` varchar(50) NOT NULL,
  `birthplace` varchar(150) NOT NULL,
  `age` varchar(10) NOT NULL,
  `gender` varchar(25) NOT NULL,
  `category` varchar(30) NOT NULL,
  `lookingfor` varchar(30) NOT NULL,
  `preference` varchar(15) NOT NULL,
  `timing` varchar(15) NOT NULL,
  `price` varchar(10) NOT NULL,
  `transactionid` varchar(100) NOT NULL,
  `paymentstatus` varchar(50) NOT NULL,
  `consultationstatus` varchar(70) NOT NULL,
  `vendorid` varchar(50) NOT NULL,
  `vendoraction` varchar(50) NOT NULL,
  `vendoracceptedon` varchar(80) NOT NULL,
  `customeraction` varchar(50) NOT NULL,
  `customeracceptedon` varchar(80) NOT NULL,
  `bookingdate` varchar(70) NOT NULL,
  `endedon` varchar(70) NOT NULL,
  `endedby` varchar(50) NOT NULL,
  `remaining_time` varchar(50) NOT NULL,
  `settled` varchar(10) NOT NULL,
  `merchantuserid` varchar(100) NOT NULL,
  `latitude` varchar(80) NOT NULL,
  `longitude` varchar(80) NOT NULL,
  `vendorreminder` varchar(10) NOT NULL,
  `customerreminder` varchar(10) NOT NULL,
  `uid` varchar(50) NOT NULL,
  `calltoken` varchar(150) NOT NULL,
  `channelName` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `consultation`
--

INSERT INTO `consultation` (`id`, `customerid`, `name`, `phone`, `birthdate`, `birthtime`, `birthplace`, `age`, `gender`, `category`, `lookingfor`, `preference`, `timing`, `price`, `transactionid`, `paymentstatus`, `consultationstatus`, `vendorid`, `vendoraction`, `vendoracceptedon`, `customeraction`, `customeracceptedon`, `bookingdate`, `endedon`, `endedby`, `remaining_time`, `settled`, `merchantuserid`, `latitude`, `longitude`, `vendorreminder`, `customerreminder`, `uid`, `calltoken`, `channelName`) VALUES
(420, '1', 'User', '7042514857', '29-01-1994', '06:01 PM', 'New Delhi, Delhi, India', '31', 'Female', 'Numerologist', 'Astrologer', 'chat', '10', '0', '', 'paid', 'ended', '85', 'initiated', '21 March 2025 , 08:53 AM', 'accepted', '21 March 2025 , 08:53 AM', '21 Mar 2025 , 08:52 PM', '21 March 2025 , 09:03 AM', 'astrovaani', '0', '', '', '28.6139298', '77.2088282', '0', '0', '', '', ''),
(435, '1', 'User', '123', '05-03-2025', '03:28 PM', 'as', '0', 'Female', 'Astrologer', 'Astrologer', 'chat', '10', '60', '', '', 'incompleted', '85', '', '', '', '', '24 Mar 2025 , 03:28 PM', '', '', '', '', '', '', '', '0', '0', '', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(1) NOT NULL,
  `name` varchar(80) NOT NULL,
  `gender` varchar(25) NOT NULL,
  `zodiac` varchar(40) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `birthdate` varchar(60) NOT NULL,
  `status` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `joineddate` varchar(70) NOT NULL,
  `consultation_id` varchar(50) NOT NULL,
  `vendor_id` varchar(50) NOT NULL,
  `consultation_status` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `gender`, `zodiac`, `mobile`, `birthdate`, `status`, `type`, `otp`, `joineddate`, `consultation_id`, `vendor_id`, `consultation_status`) VALUES
(1, 'User', 'Male', '', '7042514857', '', 'active', 'user', '', '26 March 2025 , 01:59:18 PM', '', '', ''),
(85, 'Astrologer', 'Male', '', '9667356174', '', 'active', 'vendor', '', '25 January 2025', '', '', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `community`
--
ALTER TABLE `community`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `consultation`
--
ALTER TABLE `consultation`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `community`
--
ALTER TABLE `community`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=458;

--
-- AUTO_INCREMENT for table `consultation`
--
ALTER TABLE `consultation`
  MODIFY `id` int(1) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=436;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(1) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=452;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
