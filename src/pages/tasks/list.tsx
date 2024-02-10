import {
  KanbanColumnSkeleton,
  ProjectCardSkeleton,
} from "@/components/skeleton";
import React, { DragEvent } from "react";
import { KanbanBoard, KanbanBoardContainer } from "./Kanban/Board";
import { KanbanColumn } from "./Kanban/Column";
import { KanbanItem } from "./Kanban/item";
import { useList, useNavigation, useUpdate } from "@refinedev/core";
import { TASKS_QUERY, TASK_STAGES_QUERY } from "@/graphql/queries";
import { Task, TaskStage } from "@/graphql/schema.types";
import { GetFieldsFromList } from "@refinedev/nestjs-query";
import { TasksQuery } from "@/graphql/types";
import { ProjectCard, ProjectCardMemo } from "./Kanban/Card";
import { KanbanAddCardButton } from "./Kanban/AddCardButton";
import { DragEndEvent } from "@dnd-kit/core";
import {
  UPDATE_TASK_MUTATION,
  UPDATE_TASK_STAGE_MUTATION,
} from "@/graphql/mutations";

export const TasksList = ({ children }: React.PropsWithChildren) => {
  const { replace } = useNavigation();
  const { data: stages, isLoading: isLoadingStages } = useList<TaskStage>({
    resource: "taskStages",
    meta: {
      gqlQuery: TASK_STAGES_QUERY,
    },
    sorters: [
      {
        field: "createdAt",
        order: "asc",
      },
    ],
    filters: [
      {
        field: "title",
        operator: "in",
        value: ["TODO", "IN PROGRESS", "IN REVIEW", "DONE"],
      },
    ],
  });
  const { data: tasks, isLoading: isLoadingTasks } = useList<
    GetFieldsFromList<TasksQuery>
  >({
    resource: "tasks",
    meta: {
      gqlQuery: TASKS_QUERY,
    },
    queryOptions: {
      enabled: !!stages,
    },
    sorters: [
      {
        field: "dueDate",
        order: "asc",
      },
    ],
    pagination: {
      mode: "off",
    },
  });
  const { mutate: updateTask } = useUpdate<Task>();

  const taskStages = React.useMemo(() => {
    if (!tasks?.data || !stages?.data)
      return {
        unassignedStage: [],
        stages: [],
      };

    const unassignedStage = tasks.data.filter((task) => task.stageId === null);

    // prepare unassigned stage
    const grouped: TaskStage[] = stages.data.map((stage) => ({
      ...stage,
      tasks: tasks.data.filter((task) => task.stageId?.toString() === stage.id),
    }));

    return {
      unassignedStage,
      columns: grouped,
    };
  }, [tasks, stages]);
  const handleAddCard = ({ stageId }: { stageId: string }) => {
    const path =
      stageId === "unassigned" ? "/tasks/new" : `/tasks/new?stageId=${stageId}`;
    replace(path);
  };
  const handleOnDragEnd = (event: DragEndEvent) => {
    let stageId = event.over?.id as undefined | string | null;
    const taskId = event.active.id;
    const taskStageId = event.active.data.current?.stageId;
    if (taskStageId === stageId) return;
    else if (stageId === "unassigned") stageId = null;
    updateTask({
      resource: "tasks",
      id: taskId,
      values: {
        stageId,
      },
      successNotification: false,
      mutationMode: "optimistic",
      meta: {
        gqlMutation: UPDATE_TASK_STAGE_MUTATION,
      },
    });
  };

  const isLoading = isLoadingStages || isLoadingTasks;
  if (isLoading) {
    return <PageSkeleton />;
  }
  return (
    <>
      <KanbanBoardContainer>
        <KanbanBoard onDragEnd={handleOnDragEnd}>
          <KanbanColumn
            id="unassigned"
            title="Unassigned"
            count={taskStages.unassignedStage.length || 0}
            onAddClick={() => handleAddCard({ stageId: "unassigned" })}
          >
            {taskStages.unassignedStage.map((task) => (
              <KanbanItem
                key={task.id}
                id={task.id}
                data={{ ...task, stageId: "unassigned" }}
              >
                <ProjectCardMemo
                  {...task}
                  dueDate={task.dueDate || undefined}
                />
              </KanbanItem>
            ))}
            {!taskStages.unassignedStage.length && (
              <KanbanAddCardButton
                onClick={() => handleAddCard({ stageId: "unassigned" })}
              />
            )}
          </KanbanColumn>
          {taskStages.columns?.map((stage) => (
            <KanbanColumn
              key={stage.id}
              id={stage.id}
              title={stage.title}
              count={stage.tasks.length}
              onAddClick={() => handleAddCard({ stageId: stage.id })}
            >
              {!isLoading &&
                stage.tasks.map((task) => (
                  <KanbanItem
                    key={task.id}
                    id={task.id}
                    data={{ ...task, stageId: stage.id }}
                  >
                    <ProjectCardMemo
                      {...task}
                      dueDate={task.dueDate || undefined}
                    />
                  </KanbanItem>
                ))}
              {!stage.tasks.length && (
                <KanbanAddCardButton
                  onClick={() => handleAddCard({ stageId: stage.id })}
                />
              )}
            </KanbanColumn>
          ))}
        </KanbanBoard>
      </KanbanBoardContainer>
      {children}
    </>
  );
};

const PageSkeleton = () => {
  const columnCount = 6;
  const itemCount = 4;
  return (
    <KanbanBoardContainer>
      {Array.from({ length: columnCount }).map((_, index) => (
        <KanbanColumnSkeleton key={index}>
          {Array.from({ length: itemCount }).map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </KanbanColumnSkeleton>
      ))}
    </KanbanBoardContainer>
  );
};
