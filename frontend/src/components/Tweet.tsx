import { TwitterShareButton } from "react-twitter-embed";
import { PINK_MARKETPLACE } from "../const";

export const Tweet = () => {

  return (
    <div className="group">
      <div className="centerContent">
        <div className="selfCenter spaceBetween">
          <TwitterShareButton
            onLoad={function noRefCheck() { }}
            options={{
              buttonHashtag: undefined,
              screenName: undefined,
              size: 'large',
              text: "How do you imagine your #PinkRobot 🤖 on #AstarNetwork?\n\nI just imagined and minted mine ",
              via: `\n\n${PINK_MARKETPLACE}`
            }}
            url='https://pinkrobot.me/'
          />
        </div>
      </div>
    </div>
  );
};