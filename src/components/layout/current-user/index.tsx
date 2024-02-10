import { CustomAvatar } from "@/components/custom-avatar";
import { useGetIdentity } from "@refinedev/core";
import { Button, Popover } from "antd";
import type { User } from "@/graphql/schema.types";
import { Text } from "@/components/text";
import { SettingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { AccountSettings } from "../account-settings";

const CurrentUser = () => {
  const { data: user } = useGetIdentity<User>();
  const [isOpen, setisOpen] = useState(false);
  const content = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Text strong style={{ padding: "12px 20px" }}>
        {user?.name}
      </Text>
      <div
        style={{
          borderTop: "1px solid #d9d9d9",
          padding: "4px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <Button
          type="link"
          style={{ textAlign: "left" }}
          icon={<SettingOutlined />}
          block
          onClick={() => setisOpen(true)}
        >
          Account Settings
        </Button>
      </div>
    </div>
  );
  return (
    <>
      <Popover
        placement="bottomRight"
        trigger={["click"]}
        overlayInnerStyle={{ padding: 0 }}
        overlayStyle={{ zIndex: 9999 }}
        content={content}
      >
        <CustomAvatar
          name={user?.name || ""}
          src={user?.avatarUrl}
          size="default"
          style={{ cursor: "pointer" }}
        />
      </Popover>
      {user && (
        <AccountSettings
          userId={user.id}
          opened={isOpen}
          setOpened={setisOpen}
        />
      )}
    </>
  );
};

export default CurrentUser;
