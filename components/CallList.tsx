
"use client";
import { useGetCalls } from "@/hooks/useGetCalls";
import { Call, CallRecording } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MeetingCard from "./MeetingCard";
import Loader from "./Loader";
import { useToast } from "@/hooks/use-toast";

const CallList = ({ type }: { type: "ended" | "upcoming" | "recordings" }) => {
  const { endedCalls, upcomingCalls, callRecordings, isLoading } =
    useGetCalls();
  const router = useRouter();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const {toast} = useToast();

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const callData = await Promise.all(
          callRecordings.map((meeting) => meeting.queryRecordings())
        );
        const fetchedRecordings = callData
          .filter((call) => call.recordings.length > 0)
          .flatMap((call) => call.recordings);

        setRecordings(fetchedRecordings);
      } catch (error) {
        console.log(error);
        toast({title: 'Try again later'})
      }
    };

    if (type === "recordings") fetchRecordings();
  }, [type, callRecordings,toast]);

  const calls =
    type === "recordings"
      ? recordings
      : type === "ended"
      ? endedCalls
      : upcomingCalls;

  const noCallsMessage =
    type === "ended"
      ? "No ended calls"
      : type === "upcoming"
      ? "No upcoming calls"
      : "No recordings";

  if (isLoading) return <Loader />;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {calls?.length > 0 ? (
        calls.map((meeting: Call | CallRecording) => (
          <MeetingCard
            key={(meeting as Call)?.id || (meeting as CallRecording)?.filename}
            icon={
              type === "ended"
                ? "/icons/previous.svg"
                : type === "upcoming"
                ? "/icons/upcoming.svg"
                : "/icons/recordings.svg"
            }
            title={
              (meeting as Call)?.state?.custom?.description?.substring(0, 20) ||
              (meeting as CallRecording)?.filename?.substring(0, 20) ||
              "Personal Room"
            }
            date={
              (meeting as Call)?.state?.startsAt?.toLocaleString() ||
              (meeting as CallRecording)?.start_time?.toLocaleString()
            }
            isPreviousMeeting={type === "ended"}
            buttonIcon1={type === "recordings" ? "/icons/play.svg" : undefined}
            buttonText={type === "recordings" ? "Play" : "Start"}
            handleClick={
              type === "recordings"
                ? () => router.push(`${(meeting as CallRecording).url}`)
                : () => router.push(`/meeting/${(meeting as Call).id}`)
            }
            link={
              type === "recordings"
                ? (meeting as CallRecording).url
                : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${(meeting as Call).id}`
            }
          />
        ))
      ) : (
        <h1>{noCallsMessage}</h1>
      )}
    </div>
  );
};

export default CallList;
