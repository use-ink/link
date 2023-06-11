import { Dispatch, SetStateAction, useState } from "react";
import { ContractType, PinkValues } from "../types";
import { AiStyles } from "../const";
import { styled, Tab, TabProps, Tabs } from "@mui/material";


const CustomTab = styled(Tab)<TabProps>(({ theme }) => ({
    color: theme.palette.success.main,
    '&.Mui-selected': {
        color: 'rgba(255, 105, 180, 0.9)',
    },
}));

export const PinkTabs = ({ tab, setTab }: {
    tab: ContractType,
    setTab: Dispatch<SetStateAction<ContractType>>
}) => {

    const handleTabChange = (
        event: React.SyntheticEvent,
        newTab: ContractType
    ) => {
        if (newTab !== null) {
            setTab(newTab);
        }
    };

    return (
        <div className="group">
            <Tabs
                value={tab}
                onChange={handleTabChange}
                centered
                TabIndicatorProps={{
                    style: {
                        backgroundColor: "rgba(255, 105, 180, 0.9)",
                    },
                }}
            >
                <CustomTab
                    label="Pink robot"
                    value={ContractType.PinkPsp34}
                    style={{ backgroundColor: "transparent" }}
                    className="mytab"
                />
                <CustomTab
                    label="Custom image"
                    value={ContractType.CustomUpload34}
                    style={{ backgroundColor: "transparent" }}
                />
            </Tabs>
        </div>
    );
}