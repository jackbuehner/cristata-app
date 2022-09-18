import { useEffect, useState } from 'react';
import { WebrtcProvider } from 'y-webrtc';
import { HocuspocusProvider } from '@hocuspocus/provider';

/**
 * Builds an array of objects of type `IAwarenessProfile` with duplicate values
 * from the same session removed from the array.
 */
function useAwareness(props: UseAwarenessProps): AwarenessType[] {
  // keep awareness state in sync with awareness values
  const [awareness, setAwareness] = useState<AwarenessType[]>([]);
  useEffect(() => {
    if (props.provider) {
      const pa = props.provider.awareness;

      const handleUpdate = () => {
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

        // update in state
        setAwareness(awareness);
      };

      pa.on('change', handleUpdate);
      return () => {
        pa.off('change', handleUpdate);
      };
    }
  });

  // set local user awareness field with user details
  useEffect(() => {
    if (props.user && props.provider) {
      // note: the change event is only fired if the serialized user object
      // is different, so it is okay to set this whenever the user object
      // changes (even if the serialized value does not change)
      props.provider.awareness.setLocalStateField('user', props.user);
    }
  }, [props.provider, props.user]);

  // return the array of unique and complete awareness objects
  return awareness;
}

interface UseAwarenessProps {
  provider: WebrtcProvider | HocuspocusProvider | undefined;
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
