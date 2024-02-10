import { CustomAvatar, Text } from "@/components";
import { User } from "@/graphql/schema.types";
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  EyeOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  ConfigProvider,
  Dropdown,
  MenuProps,
  Space,
  Tag,
  Tooltip,
  theme,
} from "antd";
import React, { useMemo } from "react";
import { TextIcon } from "./textIcon";
import dayjs from "dayjs";
import { getDateColor } from "@/utilities";
import { useDelete, useNavigation } from "@refinedev/core";

type Props = {
  id: string;
  title: string;
  dueDate?: string;
  users?: {
    id: string;
    name: string;
    avatarUrl?: User["avatarUrl"];
  }[];
};

export const ProjectCard = ({ id, title, dueDate, users }: Props) => {
  const { token } = theme.useToken();
  const dropdownItems = useMemo(() => {
    const dropdownItems: MenuProps["items"] = [
      {
        label: "View Card",
        key: "1",
        icon: <EyeOutlined />,
        onClick: () => {
          edit("tasks", id, "replace");
        },
      },
      {
        danger: true,
        label: "Delete Card",
        key: "2",
        icon: <DeleteOutlined />,
        onClick: () => {
          deleteCard({
            resource: "tasks",
            id,
            meta: {
              operation: "task",
            },
          });
        },
      },
    ];
    return dropdownItems;
  }, []);
  const { edit } = useNavigation();
  const { mutate: deleteCard } = useDelete();
  const dueDateOptions = useMemo(() => {
    if (!dueDate) return null;
    const date = dayjs(dueDate);
    return {
      color: getDateColor({ date: dueDate }) as string,
      text: date.format("MMM DD"),
    };
  }, [dueDate]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Tag: {
            colorText: token.colorTextSecondary,
          },
          Card: {
            headerBg: "transparent",
          },
        },
      }}
    >
      <Card
        size="small"
        title={<Text ellipsis={{ tooltip: title }}>{title}</Text>}
        onClick={() => edit("tasks", id, "replace")}
        extra={
          <Dropdown
            trigger={["click"]}
            menu={{
              items: dropdownItems,
              onPointerDown: (e) => {
                e.stopPropagation();
              },
            }}
            placement="bottom"
            arrow={{ pointAtCenter: true }}
          >
            <Button
              shape="circle"
              type="text"
              icon={
                <MoreOutlined
                  style={{
                    transform: "rotate(90deg)",
                  }}
                />
              }
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </Dropdown>
        }
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <TextIcon style={{ marginRight: "4px" }} />
          {dueDateOptions && (
            <Tag
              icon={<ClockCircleOutlined style={{ fontSize: "12px" }} />}
              style={{
                padding: "0 4px",
                marginInlineEnd: "0",
                backgroundColor:
                  dueDateOptions.color === "default" ? "transparent" : "unset",
              }}
              color={dueDateOptions.color}
              bordered={dueDateOptions.color !== "default"}
            >
              {dueDateOptions.text}
            </Tag>
          )}
          {!!users?.length && (
            <Space
              size={4}
              wrap
              direction="horizontal"
              align="center"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginLeft: "auto",
                marginRight: "0",
              }}
            >
              {users.map((user) => (
                <Tooltip title={user.name} key={user.id}>
                  <CustomAvatar
                    src={user.avatarUrl || ""}
                    name={user.name}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                    }}
                  />
                </Tooltip>
              ))}
            </Space>
          )}
        </div>
      </Card>
    </ConfigProvider>
  );
};

export const ProjectCardMemo = React.memo(
  ProjectCard,
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.title === nextProps.title &&
      prevProps.dueDate === nextProps.dueDate &&
      prevProps.users?.length === nextProps.users?.length
    );
  }
);
