import { WebrtcProvider } from 'y-webrtc';

/**
 * Builds an array of objects of type `IAwarenessProfile` with duplicate values
 * from the same session removed from the array.
 */
function useAwareness(props: UseAwarenessProps): AwarenessType[] {
  if (!props.provider) return [];

  const { awareness: pa } = props.provider;

  // set local user awareness field with user details
  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (props.user) pa.setLocalStateField('user', props.user);

  // get all current awareness information and filter it to only include
  // sessions with defined users
  const allAwarenessValues: AwarenessType[] = Array.from(pa.getStates().values())
    .filter((value) => value.user)
    .map((value) => value.user);

  // remove duplicate awareness information by only adding objects with
  // unique sessionIds to the array (session ids are create by the app and
  // stored in `sessionStorage`)
  let awareness: AwarenessType[] = [];
  allAwarenessValues.forEach((value: AwarenessType) => {
    // check whether session id is unique
    const isUnique =
      awareness.findIndex((session) => session.sessionId === value.sessionId) === -1 ? false : true;

    // only push to final awareness array if the session is unique
    if (!isUnique) {
      awareness.push(value);
    }
  });

  // return the array of unique and complete awareness objects
  return awareness;
}

interface UseAwarenessProps {
  provider: WebrtcProvider | undefined;
  user?: AwarenessType;
}

type AwarenessType = {
  name: string;
  color: string;
  sessionId: string;
  photo: string;
  [key: string]: unknown;
};

export { useAwareness };
