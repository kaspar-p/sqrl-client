import { Flex } from "@chakra-ui/react"
import { AnimateSharedLayout } from "framer-motion"
import React, { FunctionComponent, useMemo } from "react"
import { useHoverContext } from "../../HoverContext"
import { useAppContext } from "../../SqrlContext"
import {
    Day,
    minuteOffsetToTime,
    timeToMinuteOffset,
    WEEK_DAYS,
} from "../../utils/time"
import { Meeting, MeetingGroup } from "./Meeting"
import MeetingComponent from "./MeetingComponent"
import {
    MeetingTime,
    MeetingTimeCell,
    StyledHead,
    StyledTbody,
    StyledTh,
    StyledTimeLabelTd,
    StyledTimetable,
    StyledTimetableContainer,
    StyledTr,
    Palettes,
} from "./StyledTimetable"

type TimetableProps = {
    /**
     * The meetings to display on the timetable.
     */
    meetings: Meeting[]
    /**
     * The earliest time displayed on the timetable, given in minutes offset from midnight.
     */
    minTime?: number
    /**
     * The latest time displayed on the timetable, given in minutes offset from midnight.
     */
    maxTime?: number
    /**
     * The minute resolution of the timetable (in the range (0, 60]).
     */
    resolution?: number
    /**
     * The scale of the timetable
     */
    scale?: number
    /**
     * The palette of the timetable
     */
    palette?: keyof Palettes
    /**
     * Whether to highlight conflicts
     */
    highlightConflicts?: boolean
    /**
     * Clock: 12 or 24?
     */
    twentyFour?: boolean
    /**
     * Dark mode
     */
    dark?: boolean
    /**
     * Show time
     */
    showTime?: boolean
    /**
     * Emphasize on hover
     */
    emphasizeOnHover?: boolean
    /**
     * The days of the week to include on the timetable.
     */
    days?: Day[]
}

export const Timetable: FunctionComponent<TimetableProps> = ({
    meetings,
    minTime = timeToMinuteOffset(8),
    maxTime = timeToMinuteOffset(22),
    resolution = 15,
    scale = 45,
    palette = "default",
    highlightConflicts = true,
    twentyFour = true,
    dark = false,
    showTime = true,
    emphasizeOnHover = true,
    days = WEEK_DAYS,
}) => {
    const {
        state: { hoverCourseKey },
        dispatch,
    } = useHoverContext()

    const {
        state: { sidebarCourse },
        dispatch: dispatchAppContext,
    } = useAppContext()

    const setHoverCourseKey = (courseKey: number | null) => {
        dispatch({ type: "SET_CURRENT_HOVER", payload: courseKey })
    }

    // TODO: Ensure 0 < minTime < maxTime <= 60 * 24
    // TODO: Ensure that 0 < resolution <= 60

    const JSONMeetings = JSON.stringify(meetings)

    const groupsByDay = useMemo(() => {
        const meetingsMap = new Map()
        for (const meeting of meetings) {
            if (!meetingsMap.has(meeting.day)) {
                meetingsMap.set(meeting.day, [])
            }
            meetingsMap.get(meeting.day).push(meeting)
        }

        const groupsMap = new Map()
        for (const day of days) {
            if (meetingsMap.has(day)) {
                groupsMap.set(day, MeetingGroup.partition(meetingsMap.get(day)))
            } else {
                groupsMap.set(day, [])
            }
        }

        return groupsMap
        // Disabled because meetings is expressed as a dependency as the JSON string
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSONMeetings, days])

    const tableRows: Array<React.ReactNode> = []
    for (
        let currentTime = minTime;
        currentTime <= maxTime;
        currentTime += resolution
    ) {
        const timeLabel = minuteOffsetToTime(currentTime, twentyFour)
        const cells = showTime
            ? [
                  <StyledTimeLabelTd key={currentTime} className="time">
                      {timeLabel}
                  </StyledTimeLabelTd>,
              ]
            : [
                  <StyledTimeLabelTd style={{ padding: 0 }}>
                      &nbsp;
                  </StyledTimeLabelTd>,
              ]

        for (const day of days) {
            let isOccupied = false
            for (const group of groupsByDay.get(day)) {
                const groupStartTime = group.getMinStartTime()
                const groupEndTime = group.getMaxEndTime()
                if (
                    groupStartTime <= currentTime &&
                    currentTime < groupEndTime
                ) {
                    isOccupied = true
                }

                const rowspan = Math.ceil(
                    (groupEndTime - groupStartTime) / resolution
                )

                if (groupStartTime !== currentTime) continue

                if (group.meetings.length === 1) {
                    // No conflicts
                    const meeting = group.meetings[0]
                    cells.push(
                        <MeetingTimeCell
                            key={day}
                            days={days.length}
                            rowSpan={rowspan}
                            dark={dark}
                        >
                            <MeetingTime
                                courseKey={meeting.courseKey}
                                palette={palette}
                                dark={dark}
                                highlight={
                                    hoverCourseKey === meeting.courseKey &&
                                    emphasizeOnHover
                                }
                                onMouseEnter={() =>
                                    setHoverCourseKey(meeting.courseKey)
                                }
                                onMouseLeave={() => setHoverCourseKey(null)}
                                onClick={() => {
                                    dispatchAppContext({
                                        type: "SET_SIDEBAR_COURSE",
                                        payload: meeting.identifier,
                                    })
                                }}
                                style={{
                                    boxShadow:
                                        meeting.identifier === sidebarCourse
                                            ? "inset 0 0 0 0.15rem rgba(60, 142, 230, 0.7)"
                                            : "",
                                    cursor:
                                        meeting.identifier === sidebarCourse
                                            ? "default"
                                            : "",
                                }}
                            >
                                <MeetingComponent
                                    darkText={!dark}
                                    meeting={meeting}
                                    twentyFour={twentyFour}
                                />
                            </MeetingTime>
                        </MeetingTimeCell>
                    )
                } else {
                    // Conflicts
                    const percent = 100 / group.meetings.length

                    const items: Array<React.ReactNode> = []
                    group.meetings.forEach(
                        (meeting: Meeting, index: number) => {
                            const height =
                                ((meeting.endTime - meeting.startTime) /
                                    (groupEndTime - groupStartTime)) *
                                100

                            items.push(
                                <MeetingTime
                                    key={index}
                                    onMouseEnter={() =>
                                        setHoverCourseKey(meeting.courseKey)
                                    }
                                    onMouseLeave={() => setHoverCourseKey(null)}
                                    style={{
                                        position: "absolute",
                                        width: `calc(${percent}% - 0.4em)`,
                                        height: `calc(${height}% - 0.1em)`,
                                        left: `calc(${index * percent}% + ${
                                            !index ? "0.3em" : "0.1em"
                                        })`,
                                        // top position is percent of meeting starttime of group starttime
                                        top: `calc(${
                                            ((meeting.startTime -
                                                groupStartTime) /
                                                (groupEndTime -
                                                    groupStartTime)) *
                                            100
                                        }% + 0.1rem)`,
                                        backgroundColor:
                                            highlightConflicts &&
                                            // meeting.identifier !== sidebarCourse &&
                                            (!(
                                                hoverCourseKey ===
                                                meeting.courseKey
                                            ) ||
                                                !emphasizeOnHover)
                                                ? "#c53030"
                                                : "",
                                        // color: "",
                                        // highlightConflicts ||
                                        // !emphasizeOnHover ||
                                        // meeting.identifier === sidebarCourse
                                        //     ? "#fff"
                                        //     : "",

                                        lineHeight:
                                            "var(--chakra-lineHeights-base)",
                                        boxShadow:
                                            meeting.identifier === sidebarCourse
                                                ? "inset 0 0 0 0.15rem rgba(60, 142, 230, 0.7)"
                                                : "",
                                        cursor:
                                            meeting.identifier === sidebarCourse
                                                ? "default"
                                                : "",
                                    }}
                                    courseKey={meeting.courseKey}
                                    palette={palette}
                                    dark={dark}
                                    highlight={
                                        hoverCourseKey === meeting.courseKey &&
                                        emphasizeOnHover
                                    }
                                    conflict={highlightConflicts}
                                    onClick={() => {
                                        dispatchAppContext({
                                            type: "SET_SIDEBAR_COURSE",
                                            payload: meeting.identifier,
                                        })
                                    }}
                                >
                                    <MeetingComponent
                                        darkText={
                                            !(dark || highlightConflicts) ||
                                            (emphasizeOnHover &&
                                                hoverCourseKey ===
                                                    meeting.courseKey &&
                                                !dark)
                                            //  || meeting.identifier === sidebarCourse
                                        }
                                        meeting={meeting}
                                        twentyFour={twentyFour}
                                    />
                                </MeetingTime>
                            )
                        }
                    )
                    cells.push(
                        <MeetingTimeCell
                            key={day}
                            days={days.length}
                            rowSpan={rowspan}
                            dark={dark}
                        >
                            <Flex>{items}</Flex>
                        </MeetingTimeCell>
                    )
                }
                break
            }

            if (!isOccupied) {
                cells.push(
                    <MeetingTimeCell key={day} days={days.length} dark={dark} />
                )
            }
        }
        tableRows.push(
            <StyledTr
                key={currentTime}
                size={scale}
                resolution={resolution}
                dark={dark}
            >
                {cells}
            </StyledTr>
        )
    }

    return (
        <StyledTimetableContainer>
            <StyledTimetable>
                <thead>
                    <StyledHead>
                        <StyledTh dark={dark}></StyledTh>
                        {days.map((day, index) => (
                            <StyledTh key={index} dark={dark}>
                                {day.toString().substr(0, 3)}
                            </StyledTh>
                        ))}
                    </StyledHead>
                </thead>
                <StyledTbody>{tableRows}</StyledTbody>
            </StyledTimetable>
        </StyledTimetableContainer>
    )
}

// yellow dog
