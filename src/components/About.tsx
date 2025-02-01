import { Box, Link, List, ListItem, Typography } from '@mui/material';
import { Puppet } from '../mocap/Puppet.ts';



const About = ({puppets}: {puppets: Puppet[]}) => {
  return (
      <Box sx={{m: 10}}>
        <h1>About Cutting Shapes</h1>
        <Box>
          <i>Created by</i> <b>Chris Mountford</b> <i>January 2025</i>
        </Box>
        <h2>Acknowledgements</h2>
        <List>
        {puppets.map((puppet, i) => {
          return (<ListItem key={`puppet_ack_${i}`}>
            <Link href={puppet.src}>{puppet.attribution}</Link>&nbsp;<Typography>{puppet.license.longName}</Typography>
          </ListItem>);
        })}
        </List>
      </Box>
  );
};

export default About;
