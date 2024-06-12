package config

type DB struct {
	Host      string `json:"host"`
	Port      string `json:"port"`
	DbName    string `json:"dbName"`
	SSLMode   string `json:"sslMode"`
	User      string `json:"user"`
	Password  string `json:"password"`
	SecretKey string `json:"secret_key"`
}

type DBConfig struct {
	Read  DB `json:"read"`
	Write DB `json:"write"`
}
type Mode string
type Config struct {
	Mode         Mode     `json:"mode"`
	ServiceName  string   `json:"service_name"`
	HttpPort     int      `json:"http_port"`
	JwtSecretKey string   `json:"jwt_secrect_key"`
	Db           DBConfig `json:"db"`
}

var config *Config

func init() {
	config = &Config{}
}

func GetConfig() Config {
	return *config
}
