
import os
import json
import xml.etree.ElementTree as ET

class CXLParser():

    def __init__(self, filepath):

        if os.path.dirname(filepath) == '':
            filepath = os.path.join('../data/cxl', filepath)

        if not os.path.isfile(filepath):
            raise ValueError('{0} not a file'.format(filepath))

            _, ext = os.path.splitext(filepath)
            if ext != 'cxl':
                raise ValueError('The file should have an extension cxl!: {0}'.format(filepath))

        self.filepath = filepath

        tree = ET.parse(filepath)
        network = tree.getroot()[1]

        conceptList = network[0]
        linkList = network[1]
        connectionList = network[2]

        self.concepts = []
        for c in conceptList:
            self.concepts.append(c.attrib)

        self.links = []
        for l in linkList:
            self.links.append(l.attrib)

        self.connections = []
        for c in connectionList:
            self.connections.append(c.attrib)

    def exportToVisDataFile(self, filename=None, dirname=None):

        nodes, edges = self.exportToVisFormat()
        out = {'nodes': nodes, 'edges': edges}

        if filename is None:
            filename = os.path.basename(self.filepath)
            # modify the extension
            filename, ext = os.path.splitext(filename)
            filename = filename + ".json"

        if dirname is None:
            dirname = '../data/visData'

        filepath = os.path.join(dirname, filename)
        print('Exporting json file to {0}'.format(filepath))

        with open(filepath, 'w+') as outfile:  
            json.dump(out, outfile)

    def exportToVisFormat(self):

        nodes = self.concepts
        edges = []
        for link in self.links:
            label = link['label']
            link_id = link['id']
            from_node_id = None
            to_node_id = None
            
            for conn in self.connections:
                # There exist two "connections" per a single link. 
                # A connection links from a node to a link, and from the link to another node
                # Some links may have both connections pointing to itself

                if link_id == conn['from-id']:
                    if to_node_id is None:
                        to_node_id = conn['to-id']
                    else:
                        from_node_id = conn['to-id']

                elif link_id == conn['to-id']:
                    if from_node_id is None:
                        from_node_id = conn['from-id']
                    else:
                        to_node_id = conn['from-id']
                    
            if from_node_id is None or to_node_id is None:
                print(label, link_id)
                raise ValueError("Connection to link not found")

            edges.append({'from': from_node_id, 'to': to_node_id, 'label': label})

        return nodes, edges



