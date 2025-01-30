"use client";

import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import React from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const EndcallButton = () => {
  const call = useCall();
  const router = useRouter();

  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant &&
    call?.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

    if (!isMeetingOwner) return null;
    return (
      <Button
        onClick={async () => {
          try {
            await call.endCall();
            router.push("/");
          } catch (error) {
            console.error("Failed to end call:", error);
          }
        }}
        className="bg-red-500"
      >
        End Call for everyone
      </Button>
    );
  };

export default EndcallButton;
