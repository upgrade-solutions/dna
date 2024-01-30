# frozen_string_literal: true
require 'spec_helper'
require 'yaml'

# DNA:
#   Description: DNA for a blog
#   Version: 1.0
#   Schemas: []
RSpec.describe DNA::Spec do  
  describe '#from_dna_hash (valid)' do
    let(:dna_hash) do
      YAML.load_file(File.join(__dir__, '../fixtures/yaml/dna_basic.yml'))
    end

    it 'should have basic attributes and schemas' do
      allow(DNA::Spec::Schema).to receive(:array_from_dna_hash).and_return([])
      subject = described_class.from_dna_hash(dna_hash)
      expect(subject.valid?).to be_truthy
      expect(subject.name).to eq('DNA')
      expect(subject.description).to eq(dna_hash.dig('DNA', 'Description'))
      expect(subject.version).to eq(dna_hash.dig('DNA', 'Version'))
    end
  end

  describe '#initialize (invalid)' do
    it 'should not have a valid name' do
      subject = described_class.new
      expect(subject.valid?).to be_falsey
      expect(subject.errors[:name]).to include("A DNA spec must start with 'DNA'")
    end

    it 'should not have a valid description' do
      subject = described_class.new(name: "DNA", description: 1)
      expect(subject.valid?).to be_falsey
      expect(subject.errors[:description]).to include("must be a string")
    end

    it 'should not have a valid version' do
      subject = described_class.new(name: "DNA", version: '1.0.1')
      expect(subject.valid?).to be_falsey
      expect(subject.errors[:version]).to include("must be a numeric (e.g. 1, 1.0, not 1.0.1)")
    end

    it 'should not have valid schemas' do
      subject = described_class.new(name: "DNA", schemas: {})
      expect(subject.valid?).to be_falsey
      expect(subject.errors[:schemas]).to include("must be an array")
    end
  end
end