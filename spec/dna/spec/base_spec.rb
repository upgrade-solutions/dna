# frozen_string_literal: true
require 'spec_helper'
require 'yaml'

RSpec.describe DNA::Spec::Base do
  describe 'class methods' do
    context '#from_dna_hash' do
      let(:dna_hash) do
        YAML.load_file(File.join(__dir__, '../../fixtures/yaml/dna_basic.yml'))
      end
      # let(:dna) { 'DNA' }
      # let(:version) { 1.0 }

      it 'calls #new' do
        expect(described_class).to receive(:new).with(dna_hash)
        described_class.from_dna_hash(dna_hash)
      end
    end
  end

  describe 'instance methods' do
    # context '#initialize' do
    #   let(:dna) { 'DNA' }
    #   subject do
    #     described_class.new(dna: dna)
    #   end

    #   it 'creates an instance with the correct attributes' do
    #     expect(subject.dna).to eq(dna)
    #   end
    # end
  end
end
