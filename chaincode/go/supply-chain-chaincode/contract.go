package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/satori/go.uuid"
	"strconv"
)

const (
	contractIndex = "Contract"
)

const (
	contractKeyFieldsNumber      = 1
	contractBasicArgumentsNumber = 8
)

//contract state constants (from 0 to 2)
const (
	stateContractUnknown = iota
	stateContractSigned
	stateContractCompleted
)

var contractStateLegal = map[int][]int{
	stateContractUnknown:   {},
	stateContractSigned:    {},
	stateContractCompleted: {},
}

var contractStateMachine = map[int][]int{
	stateContractUnknown:   {stateContractUnknown},
	stateContractSigned:    {stateContractCompleted},
	stateContractCompleted: {stateContractCompleted},
}

type ContractKey struct {
	ID string `json:"id"`
}

type ContractValue struct {
	ConsignorName string  `json:"consignorName"`
	ConsigneeName string  `json:"consigneeName"`
	TotalDue      float32 `json:"totalDue"`
	Quantity      int     `json:"quantity"`
	Destination   string  `json:"destination"`
	DueDate       int64   `json:"dueDate"`
	PaymentDate   int64   `json:"paymentDate"`
	State         int     `json:"state"`
	Timestamp     int64   `json:"timestamp"`
}

type Contract struct {
	Key   ContractKey   `json:"key"`
	Value ContractValue `json:"value"`
}

func CreateContract() LedgerData {
	return new(Contract)
}

//argument order
//0		1				2				3			4			5			6		7			8
//ID	ConsignorName	ConsigneeName	TotalDue	Qauntity	Destination	DueDate	PaymentDate	State
func (entity *Contract) FillFromArguments(stub shim.ChaincodeStubInterface, args []string) error {
	if len(args) < contractBasicArgumentsNumber {
		return errors.New(fmt.Sprintf("arguments array must contain at least %d items", contractBasicArgumentsNumber))
	}

	//TODO: checking consignorName by CA
	consignorName := args[1]
	if consignorName == "" {
		message := fmt.Sprintf("consignorName must be not empty")
		return errors.New(message)
	}
	entity.Value.ConsignorName = consignorName

	//TODO: checking consigneeName by CA
	consigneeName := args[2]
	if consigneeName == "" {
		message := fmt.Sprintf("consigneeName must be not empty")
		return errors.New(message)
	}
	entity.Value.ConsigneeName = consigneeName

	// checking totalDue
	totalDue, err := strconv.ParseFloat(args[3], 32)
	if err != nil {
		return errors.New(fmt.Sprintf("unable to parse the totalDue: %s", err.Error()))
	}
	if totalDue < 0 {
		return errors.New("totalDue must be larger than zero")
	}
	entity.Value.TotalDue = float32(totalDue)

	//checking quantity
	quantity, err := strconv.Atoi(args[4])
	if err != nil {
		return errors.New(fmt.Sprintf("quantity is invalid: %s (must be int)", args[4]))
	}
	entity.Value.Quantity = quantity

	//checking dueDate
	dueDate, err := strconv.ParseInt(args[6], 10, 64)
	if err != nil {
		return errors.New(fmt.Sprintf("unable to parse the dueDate: %s", err.Error()))
	}

	if dueDate < 0 {
		return errors.New("dueDate must be larger than zero")
	}
	entity.Value.DueDate = int64(dueDate)

	//checking paymentDate
	paymentDate, err := strconv.ParseInt(args[7], 10, 64)
	if err != nil {
		return errors.New(fmt.Sprintf("unable to parse the paymentDate: %s", err.Error()))
	}

	if paymentDate < 0 {
		return errors.New("paymentDate must be larger than zero")
	}
	entity.Value.PaymentDate = int64(paymentDate)

	//checking state
	state, err := strconv.Atoi(args[8])
	if err != nil {
		return errors.New(fmt.Sprintf("contract state is invalid: %s (must be int)", args[8]))
	}
	if !Contains(contractStateLegal, state) {
		return errors.New(fmt.Sprintf("contract state is invalid: %d (must be from 0 to %d)", state, len(contractStateLegal)))
	}
	entity.Value.State = state

	return nil
}

func (entity *Contract) FillFromCompositeKeyParts(compositeKeyParts []string) error {
	if len(compositeKeyParts) < contractKeyFieldsNumber {
		return errors.New(fmt.Sprintf("composite key parts array must contain at least %d items", contractKeyFieldsNumber))
	}

	if id, err := uuid.FromString(compositeKeyParts[0]); err != nil {
		return errors.New(fmt.Sprintf("unable to parse an ID from \"%s\"", compositeKeyParts[0]))
	} else if id.Version() != uuid.V4 {
		return errors.New("wrong ID format; expected UUID version 4")
	}

	entity.Key.ID = compositeKeyParts[0]

	return nil
}

func (entity *Contract) FillFromLedgerValue(ledgerValue []byte) error {
	if err := json.Unmarshal(ledgerValue, &entity.Value); err != nil {
		return err
	} else {
		return nil
	}
}

func (entity *Contract) ToCompositeKey(stub shim.ChaincodeStubInterface) (string, error) {
	compositeKeyParts := []string{
		entity.Key.ID,
	}

	return stub.CreateCompositeKey(contractIndex, compositeKeyParts)
}

func (entity *Contract) ToLedgerValue() ([]byte, error) {
	return json.Marshal(entity.Value)
}
