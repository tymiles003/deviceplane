import styled from 'styled-components';
import { space, color, typography, border } from 'styled-system';

const Badge = styled.div`
  border: ${props => `1px solid ${props.theme.colors.white}`};
  color: ${props => props.theme.colors.white};
  text-transform: uppercase;
  border-radius: 3px;
  ${color} ${space} ${typography} ${border};
  padding: 2px 4px;
`;

Badge.defaultProps = {
  fontSize: 0,
  fontWeight: 4,
};

export default Badge;
