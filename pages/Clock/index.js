
import React, { useEffect, useState } from "react";

function Clock({endTime}) {
const calculateTimeLeft = () => {
  let year = new Date().getFullYear();
  //let difference = endTime - Math.floor(Date.now() / 1000)
  let difference = endTime - Math.floor(Date.now() / 1000)
  //const difference = +new Date(`${year}-10-19`) - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (60 * 60 * 24)),
      hours: Math.floor((difference / (60 * 60)) % 24),
      minutes: Math.floor((difference  / 60) % 60),
      seconds: Math.floor((difference ) % 60),
    };
  }

  return timeLeft;
};

const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
const [year] = useState(new Date().getFullYear());

useEffect(() => {
  let timer = setTimeout(() => {
    setTimeLeft(calculateTimeLeft());
  }, 1000);

  return () => {
    clearTimeout(timer);
  }
});

const timerComponents = [];

Object.keys(timeLeft).forEach((interval) => {
  if (!timeLeft[interval]) {
    return;
  }

  timerComponents.push(
    <span>
      {timeLeft[interval]} {interval}{" "}
    </span>
  );
});
return (
  <p>
    {timerComponents.length ? timerComponents : <span>Time's up!</span>}
  </p>
);
}

export default Clock;
