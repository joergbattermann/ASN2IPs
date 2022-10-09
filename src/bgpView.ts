export interface BGPViewApiResponse {
    status:         string;
    status_message: string;
    data:           ASNPrefixes | null;
    "@meta":        BGPViewMetaInformation;
}

export interface BGPViewMetaInformation {
    time_zone:      string;
    api_version:    number;
    execution_time: string;
}

export interface ASNPrefixes {
    ipv4_prefixes: IpPrefix[] | null;
    ipv6_prefixes: IpPrefix[] | null;
}

export interface IpPrefix {
    prefix:       string;
    ip:           string;
    cidr:         number;
    roa_status:   string | null;
    name:         string | null;
    description:  string | null;
    country_code: string | null;
    parent:       IpPrefixParent | null;
}

export interface IpPrefixParent {
    prefix:            string | null;
    ip:                string | null;
    cidr:              number | null;
    rir_name:          string | null;
    allocation_status: string | null;
}