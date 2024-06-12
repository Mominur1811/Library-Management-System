package db

import (
	"fmt"
	"librarymanagement/logger"
	"log/slog"
)

type Vendor struct {
	V_Name  string `db:"vendor_name"          validate:"required,min=6,max=20"        json:"v_name"   `
	V_Email string `db:"vendor_email"         validate:"required,email"               json:"v_email"   `
	V_Pass  string `db:"password"             validate:"required,min=4,max=40"        json:"v_pass"   `
}

type VendorRepo struct {
	VendorTableName string
}

var vendorRepo *VendorRepo

func InitVendorRepo() {
	fmt.Println("I am called")
	vendorRepo = &VendorRepo{VendorTableName: `vendor`}
}

func GetVendorRepo() *VendorRepo {
	return vendorRepo
}

func (r *VendorRepo) IsExistVendor(newVendor *Vendor) (*Vendor, error) {

	return nil, nil
}

func (r *VendorRepo) NewRegistration(newVendor *Vendor) (*Vendor, error) {

	column := map[string]interface{}{
		"vendor_name":  newVendor.V_Name,
		"vendor_email": newVendor.V_Email,
		"password":     newVendor.V_Pass,
	}
	var columns []string
	var values []any
	for columnName, columnValue := range column {
		columns = append(columns, columnName)
		values = append(values, columnValue)
	}
	fmt.Println(r.VendorTableName)
	qry, args, err := GetQueryBuilder().
		Insert(r.VendorTableName).
		Columns(columns...).
		Suffix(`
			RETURNING 
			vendor_id,
			vendor_name,
			vendor_email,
			password
		`).
		Values(values...).
		ToSql()
	if err != nil {
		slog.Error(
			"Failed to create insert user query",
			logger.Extra(map[string]any{
				"error": err.Error(),
				"query": qry,
				"args":  args,
			}),
		)
		return nil, err
	}
	// Execute the SQL query and get the result
	var insertedVendor Vendor
	var insertedVendorId int
	err = GetReadDB().QueryRow(qry, args...).Scan(&insertedVendorId, &insertedVendor.V_Name, &insertedVendor.V_Email, &insertedVendor.V_Pass)
	if err != nil {
		slog.Error(
			"Failed to execute insert query",
			logger.Extra(map[string]interface{}{
				"error": err.Error(),
				"query": qry,
				"args":  args,
			}),
		)
		return nil, err
	}

	return &insertedVendor, nil
}
