"use client";
import { Button } from "antd";

export default function Home() {
  return (
    <div>
      <Button type="default" onClick={console.log}>
        Primary Button
      </Button>
    </div>
  );
}
