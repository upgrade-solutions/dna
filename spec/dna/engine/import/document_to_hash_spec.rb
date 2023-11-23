# frozen_string_literal: true
require 'spec_helper'

RSpec.describe DNA::Engine::Import::DocumentToHash do
  describe ".import_from_string" do
    let(:result_hash) { {"definitions"=>{"Student"=>{"type"=>"object", "required"=>["firstName", "lastName", "age"], "properties"=>{"firstName"=>{"type"=>"string"}, "lastName"=>{"type"=>"string"}, "age"=>{"type"=>"integer"}}}}, "$ref"=>"Student"} }

    context 'with valid JSON' do
      let(:json_string) { "{\"definitions\":{\"Student\":{\"type\":\"object\",\"required\":[\"firstName\",\"lastName\",\"age\"],\"properties\":{\"firstName\":{\"type\":\"string\"},\"lastName\":{\"type\":\"string\"},\"age\":{\"type\":\"integer\"}}}},\"$ref\":\"Student\"}" }

      it 'creates a new instance and assigns the JSON hash' do
        result = described_class.new(input_string: json_string)
        expect(result.hash).to eq result_hash
      end
    end

    context 'with valid YAML' do
      let(:yaml_string) { "definitions:\n  Student:\n    type: object\n    required:\n      - firstName\n      - lastName\n      - age\n    properties:\n      firstName:\n        type: string\n      lastName:\n        type: string\n      age:\n        type: integer\n$ref: Student\n" }

      it 'creates a new instance and assigns the YAML hash' do
        result = described_class.new(input_string: yaml_string)
        expect(result.hash).to eq result_hash
      end
    end

    context 'with invalid JSON' do
      let(:invalid_json) { 'invalid' }

      it 'returns an error' do
        result = described_class.new(input_string: invalid_json)
        expect(result.errors).to eq 'Invalid JSON/YAML'
      end
    end
  end
end
