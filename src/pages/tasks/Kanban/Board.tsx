import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import React from "react";

export const KanbanBoardContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <div
      style={{
        width: "calc(100% + 64px)",
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        margin: "-32px",
      }}
    >
      <div
        style={{
          display: "flex",
          margin: "32px",
          width: "100%",
          height: "100%",
          padding: "32px",
          overflowX: "scroll",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const KanbanBoard = ({
  children,
  onDragEnd,
}: React.PropsWithChildren<{ onDragEnd: (event: DragEndEvent) => void }>) => {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);
  return (
    <DndContext onDragEnd={onDragEnd} sensors={sensors}>
      {children}
    </DndContext>
  );
};
