import styled from 'styled-components';
import { space, color, typography, border } from 'styled-system';

const Code = styled.code`
    display: inline-block;
    word-break: break-word;
    ${space} ${color} ${typography} ${border}
`;

Code.defaultProps = {
  bg: 'grays.10',
  color: 'black',
  fontSize: 1,
  fontFamily: 'code',
  padding: 1,
  margin: 0,
  borderRadius: 1,
};

export default Code;
