import {
  CameraControls,
  ContactShadows,
  Environment
} from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatarfemalestatic";
import { AvatarGay } from "./avatargay";
import { Avatarthree } from "./avatarthree"
import { Avatarfour } from "./avatarfour"
import { Avatarfive } from "./avatarfive"
import { Avatarsix } from "./avatarsix"

export const Experience = () => {
  const cameraControls = useRef();
  const [AvatarMesh, setAvatarMesh] = useState(null);

  useEffect(() => {
    cameraControls.current.setLookAt(0, 1.5, 1.5, 0, 1.6, 0);
  }, []);

  useEffect(() => {
    const getAvatar = (avatarId) => {
      const avatarMap = {
        'avatar-one': <AvatarGay />,
        'avatar-two': <Avatar />,
        'avatar-three': <Avatarthree />,
        'avatar-four': < Avatarfour />,
        'avatar-five': < Avatarfive />,
        'avatar-six': <Avatarsix />
      };
      setAvatarMesh(avatarMap[avatarId])
    };
    getAvatar(sessionStorage.getItem('avatarSelected'));
  }, [])

  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="sunset" />
      {AvatarMesh}
      <ContactShadows opacity={0.7} />
    </>
  );
};
