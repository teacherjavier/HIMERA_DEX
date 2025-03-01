
import React from "react";
import { Position } from "../../../types/position";

interface PositionRowProps {
  position: Position;
}

export const PositionRow = ({ position }: PositionRowProps) => (
  <tr className="text-sm text-[#E7E7E6]">
    <td className="p-4">{position.pool}</td>
    <td className="p-4">{position.date}</td>
    <td className="p-4">{position.price}</td>
    <td className="p-4">{position.shares}</td>
    <td className="p-4">{position.value}</td>
  </tr>
);
