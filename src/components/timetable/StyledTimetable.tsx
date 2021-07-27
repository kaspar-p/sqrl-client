import styled from "styled-components"
import { chakra } from "@chakra-ui/react"

export const hexToRgb = (hex: string) => {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
  
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export const courseKeyToColour = (courseKey: number, colours?: string[], alpha: number = 1, lightenPercent: number = 0) => {
    const defaultColours = [
        "eaeaea",
        "c9ebab",
        "d6e2eb",
        "fce4d1",
        "d1dbf5",
        "c9f7f7",
        "eeead6",
        "e6f9d9",
        "c0dcf3",
        "c1f1e7",
        "dbcfed",
    ]
    colours = colours || defaultColours
    const hex = `#${colours[courseKey % colours.length]}`
    const rgb = hexToRgb(hex)
    // Darken
    let r = Math.min(rgb.r * (100 + lightenPercent) / 100, 255)
    let g = Math.min(rgb.g * (100 + lightenPercent) / 100, 255)
    let b = Math.min(rgb.b * (100 + lightenPercent) / 100, 255)
    // Format to css rgba value
    return `rgba(${r}, ${g}, ${b}, ${alpha})` 
}

export const StyledTimetableContainer = styled(chakra.div)`
    width: 100%;
    overflow-x: scroll;
    font-size: 0.625rem;
    /* background: #fafafa; */
`

export const StyledTimetable = styled.table`
    display: table;
    width: calc(100% - 0.25rem);
    min-width: 500px;
    margin: 1rem;
    margin-left: 0;
    padding: 0;
    border-collapse: collapse;
    @media print {
        width: 100vw;
        margin: 0;
    }
`

export const StyledHead = styled.tr`
    /* background-color: red; */
`

export const StyledTh = styled.th`
    border-right: 1px solid #e2e8f0;
    font-size: 1rem;
    padding-bottom: 0.8em;

    &:first-of-type:not() {
        width: ${({ days = 5 }: { days?: number }) =>
            `calc((100% - 4em) / ${days})`};
    }

    /* &:last-of-type {
        border-right: none;
    } */
`

export const StyledTr = styled.tr<{ size: number; resolution: number }>`
    & .time {
        text-align: right;
        color: transparent;
        font-size: 1.4em;
        &::after {
            content: "-";
            color: rgba(0, 0, 0, 0.2);
        }
    }

    /* set line height for noninteger times */
    & td {
        line-height: ${({ size = 20 }: { size?: number }) =>
            (size / 100) * 2 + "em"};

        transition: line-height 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    }

    &:nth-child(${({ resolution = 15 }: { resolution?: number }) =>
                `${60 / resolution}n - ${60 / resolution - 1}`}) {
        & td {
            line-height: var(--chakra-lineHeights-base);
        }

        position: relative;
        /* 
        &:hover::after {
            content: "";
            width: 100%;
            display: block;
            position: absolute;
            left: 0;
            right: 0;
            height: 1px;
            top: 0.1em;
            background-color: rgba(0, 0, 0, 0.6);
            border-top: 1px solid black;
        } */

        .time {
            color: #333;
            font-weight: 500;

            &::after {
                content: "";
            }
        }
    }
`

export const StyledTbody = styled.tbody``

export const StyledTimeLabelTd = styled.td`
    width: 1px;
    font-variant-numeric: proportional-nums;
    font-family: interstate-mono, monospace;
    padding-right: 1em;
    border-right: 1px solid #e2e8f0;
    position: relative;
    top: -0.6em;

    font-size: 1.4em;
    line-height: 1.4em;
`

export const MeetingTimeCell = styled.td`
    padding: 0;
    position: relative;
    font-size: 1.2em;
    width: ${({ days = 5 }: { days: number }) => `calc((100%)  / ${days})`};
    border-right: 1px solid #e2e8f0;

    /* &:last-child {
        border-right: none;
    } */
`

export const MeetingTime = styled.div`
    position: absolute;
    top: 0.2em;
    right: 0.3em;
    bottom: 0;
    left: 0.3em;

    /* border-radius: 0.3em; */

    &,
    & > * {
        /* flex: 1; */
        word-break: keep-all;
        /* white-space: nowrap; */
        overflow: hidden;
        text-overflow: ellipsis;
    }

    font-weight: 500;
    /* line-height: 1.5em; */

    padding: 0.6rem;

    @media (max-width: 600px) {
        padding: 0.3rem;
        padding-left: 0.4rem;
    }
    padding-right: 0em;
    box-shadow: 1px 1px 4px -3px rgba(0, 0, 0, 0.4);
    transition: background-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    background-color: ${({
        courseKey = 0,
        palette,
    }: {
        courseKey: number
        palette: string
    }) => courseKeyToColour(courseKey, palettes[palette] as any)};
    /* color: ${({ palette }) => (palette === "accessible" ? "#fff" : "")}; */

    @media print {
        font-size: 10pt;
        line-height: 12pt;
        border: 1px solid black;
        box-shadow: none;

        &,
        & > * {
            /* white-space: nowrap; */
            overflow: visible;
        }
    }
`

// export const TimeLabelCell = styled(MeetingTimeCell)``

const palettes = {
    default: [
        "eaeaea",
        "fce8b1",
        "e0f2ff",
        "c0fac7",
        // "c9f7f7",
        "d6d5f2",
        "c0dcf3",
        "ffe6de",
        "d1dbf5",
        "e6f9d9",
        "c1f1e7",
        "dbcfed",
    ],
    // default: [
    //     "eaeaea",
    //     "c9ebab",
    //     "d6e2eb",
    //     "fce4d1",
    //     "d1dbf5",
    //     "c9f7f7",
    //     "eeead6",
    //     "e6f9d9",
    //     "c0dcf3",
    //     "c1f1e7",
    //     "dbcfed",
    // ],
    accessible: ["70ff63", "6863ff", "f00", "0f0", "00f", "0ff"],
    monochrome: ["eaeaea"],
}
