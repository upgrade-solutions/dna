# frozen_string_literal: true
require 'spec_helper'
require 'yaml'

# ArticlePublished:
#   Description: DNA for a blog
#   Version: 1.0
#   Properties: []
# AuthorAdded: ...
RSpec.describe DNA::Spec::Schema do
  describe 'class methods' do
    context '#array_from_dna_hash' do
      let(:dna_schemas) do
        YAML.load_file(File.join(__dir__, '../../fixtures/yaml/dna_schemas.yml'))
      end
      let(:name) { 'ArticlePublished' }

      it 'should have basic attributes and schemas' do
        allow(DNA::Spec::Property).to receive(:array_from_dna_hash).and_return([])
        subject = described_class.array_from_dna_hash(dna_schemas)
        expect(subject.is_a?(Array)).to be_truthy
        expect(subject[0].valid?).to be_truthy
        expect(subject[0].name).to eq(name)
        expect(subject[0].description).to eq(dna_schemas.dig(name, 'Description'))
        expect(subject[0].version).to eq(dna_schemas.dig(name, 'Version'))
      end
    end
  end

  describe 'instance methods' do
    describe '#initialize (valid)' do
      let(:name) { 'ArticlePublished' }
      let(:description) { 'Article published event' }
      let(:version) { 1.0 }
      let(:properties) { [] }

      it 'should have basic attributes and schemas' do
        allow(DNA::Spec::Property).to receive(:array_from_dna_hash).and_return([])
        subject = described_class.new(name: name, description: description, version: version, properties: properties)
        expect(subject.valid?).to be_truthy
        expect(subject.name).to eq(name)
        expect(subject.description).to eq(description)
        expect(subject.version).to eq(version)
        expect(subject.properties).to eq(properties)
      end
    end

    describe '#initialize (invalid)' do
      it 'should not have a valid name' do
        subject = described_class.new
        expect(subject.valid?).to be_falsey
        expect(subject.errors[:name]).to include("must be present and a string")
      end

      it 'should not have a valid description' do
        subject = described_class.new(name: "ArticlePublished", description: 1)
        expect(subject.valid?).to be_falsey
        expect(subject.errors[:description]).to include("must be a string")
      end

      it 'should not have a valid version' do
        subject = described_class.new(name: "ArticlePublished", version: '1.0.1')
        expect(subject.valid?).to be_falsey
        expect(subject.errors[:version]).to include("must be a numeric (e.g. 1, 1.0, not 1.0.1)")
      end

      it 'should not have valid properties' do
        subject = described_class.new(name: "ArticlePublished", properties: {})
        expect(subject.valid?).to be_falsey
        expect(subject.errors[:properties]).to include("must be an array")
      end
    end
  end
end
