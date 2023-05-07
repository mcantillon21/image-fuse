import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useInterval } from 'usehooks-ts'

const H1 = styled.h1`
  font-family: 'Inter';
  font-weight: 600;
  font-size: 26px;
  line-height: 48px;
  /* identical to box height, or 120% */

  text-align: center;

  background: radial-gradient(
    123.44% 123.44% at 56.63% 100%,
    #ececee 6.77%,
    rgba(255, 255, 255, 0.45) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
`

const P = styled.p`
  font-family: 'Inter V', 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 32px;
  /* identical to box height, or 160% */

  text-align: center;
  letter-spacing: -0.01em;

  background: radial-gradient(
    123.44% 123.44% at 56.63% 100%,
    rgba(236, 236, 238, 0.5) 6.77%,
    rgba(255, 255, 255, 0.225) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export default function Intro() {
  const [num, setNum] = useState('Loading...')

  // Calculate the number of crushes submitted based on the time difference between now and February 6th 2023 12AM PT where each 1-4 seconds adds another crush
  useEffect(() => {
    const now = new Date()
    const then = new Date(2023, 1, 5, 12, 0)
    const diff = now.getTime() - then.getTime()

    // Convert to seconds difference
    const seconds = Math.floor(diff / 1000)

    // console.log('Seconds', seconds);

    // Every 5 seconds corresponds to a crush
    const crushes = Math.floor(seconds / 20) - 19000;

    setNum(crushes)
  }, [])

  return (
    <Wrapper>
      <H1>results out soon...</H1>
    </Wrapper>
  )
}
