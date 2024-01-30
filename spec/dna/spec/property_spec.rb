# frozen_string_literal: true
require 'spec_helper'
require 'yaml'

RSpec.describe DNA::Spec::Property do
  context 'class methods' do 
    describe '#array_from_dna_hash' do
      let(:dna_properties) {
        YAML.load(<<~YAML
          Title:
            Description: The title of a blog post
            PropertyType: String
            StringMaxLength: 30
          Published: Boolean
          DatePublished: Date
        YAML
        )
      }    

      it 'should call new from basic and expanded' do
        expect(DNA::Spec::Property).to receive(:new_from_basic).and_return({}).exactly(2).times
        expect(DNA::Spec::Property).to receive(:new_from_expanded).and_return({}).exactly(1).times
        subject = described_class.array_from_dna_hash(dna_properties)
        expect(subject.is_a?(Array)).to be_truthy
      end
    end

    describe '#new_from_basic' do
      it 'should instantiate' do
        name = 'Published'
        property_type = 'Boolean'
        subject = described_class.new_from_basic(name, property_type)
        expect(subject.name).to eq(name)
        expect(subject.property_type).to eq(property_type)
      end
    end

    describe '#new_from_expanded' do
      let(:dna_property) {
        YAML.load(<<~YAML
          Title:
            Description: The title of a blog post
            PropertyType: String
            StringMaxLength: 30
        YAML
        )
      }    
      it 'should instantiate' do
        key = dna_property.keys.first
        value = dna_property.values.first
        subject = described_class.new_from_expanded(key, value)
        expect(subject.name).to eq(key)
        expect(subject.property_type).to eq('String')
        expect(subject.description).to eq('The title of a blog post')
        expect(subject.string_max_length).to eq(30)
      end
    end
  end
end
