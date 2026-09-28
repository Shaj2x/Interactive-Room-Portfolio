import { Composition } from 'remotion';
import { DURATION, LaunchVideo } from './LaunchVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LaunchVideo"
        component={LaunchVideo}
        durationInFrames={DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
